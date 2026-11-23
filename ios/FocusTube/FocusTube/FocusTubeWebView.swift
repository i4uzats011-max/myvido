import SwiftUI
import WebKit

struct FocusTubeWebView: UIViewRepresentable {
    @ObservedObject var playerManager = BackgroundPlayerManager.shared
    @Binding var isLoading: Bool
    @Binding var canGoBack: Bool
    @Binding var canGoForward: Bool
    let targetUrl: URL
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeUIView(context: Context) -> WKWebView {
        let contentController = WKUserContentController()
        
        // 1. Injected JavaScript bridge for iOS background audio and lock screen sync
        let bridgeScriptSource = """
        (function() {
            if (window.__focustube_ios_bridge_active) return;
            window.__focustube_ios_bridge_active = true;

            function postToNative(eventType, payload) {
                try {
                    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.focusTubeAudio) {
                        window.webkit.messageHandlers.focusTubeAudio.postMessage(Object.assign({ type: eventType }, payload || {}));
                    }
                } catch(e) {
                    console.warn('[FocusTube Bridge] Post error:', e);
                }
            }

            // Sync Navigator MediaSession changes with iOS Lock Screen
            var lastTitle = '';
            var lastArtist = '';
            var lastState = '';
            
            setInterval(function() {
                try {
                    if (navigator.mediaSession && navigator.mediaSession.metadata) {
                        var meta = navigator.mediaSession.metadata;
                        var title = meta.title || 'FocusTube';
                        var artist = meta.artist || 'FocusTube';
                        var state = navigator.mediaSession.playbackState || 'playing';
                        var artwork = '';
                        if (meta.artwork && meta.artwork.length > 0) {
                            artwork = meta.artwork[meta.artwork.length - 1].src || '';
                        }
                        
                        if (title !== lastTitle || artist !== lastArtist || state !== lastState) {
                            lastTitle = title;
                            lastArtist = artist;
                            lastState = state;
                            postToNative('mediaState', {
                                title: title,
                                artist: artist,
                                artwork: artwork,
                                state: state
                            });
                        }
                    }
                } catch(err) {}
            }, 800);

            // Listen to YouTube player state events
            window.addEventListener('message', function(event) {
                try {
                    var data = event.data;
                    if (typeof data === 'string') {
                        try { data = JSON.parse(data); } catch(e) {}
                    }
                    if (data && data.event === 'onStateChange') {
                        // 1 = playing, 2 = paused
                        if (data.info === 1) {
                            postToNative('stateChange', { state: 'playing' });
                        } else if (data.info === 2) {
                            postToNative('stateChange', { state: 'paused' });
                        }
                    }
                } catch(e) {}
            });

            console.log('[FocusTube iOS Bridge] Successfully initialized in WebKit');
        })();
        """
        
        let userScript = WKUserScript(
            source: bridgeScriptSource,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: false
        )
        contentController.addUserScript(userScript)
        contentController.add(context.coordinator, name: "focusTubeAudio")
        
        // 2. Configure WKWebView for full background audio & inline playback
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.allowsPictureInPictureMediaPlayback = true
        config.allowsAirPlayForMediaPlayback = true
        
        // Custom user-agent so YouTube serves the cleanest mobile touch interface
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = true
        webView.backgroundColor = UIColor(red: 15/255, green: 15/255, blue: 15/255, alpha: 1.0)
        webView.isOpaque = false
        
        // Setup Pull-to-refresh
        let refreshControl = UIRefreshControl()
        refreshControl.tintColor = .systemRed
        refreshControl.addTarget(context.coordinator, action: #selector(Coordinator.handleRefresh(sender:)), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl
        
        // Attach reference to BackgroundPlayerManager
        BackgroundPlayerManager.shared.webView = webView
        
        // Load initial target URL
        let request = URLRequest(url: targetUrl, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        webView.load(request)
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // If target URL changed externally
        if uiView.url?.absoluteString != targetUrl.absoluteString && uiView.url == nil {
            let request = URLRequest(url: targetUrl)
            uiView.load(request)
        }
    }
    
    // MARK: - Coordinator
    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        var parent: FocusTubeWebView
        
        init(_ parent: FocusTubeWebView) {
            self.parent = parent
        }
        
        @objc func handleRefresh(sender: UIRefreshControl) {
            parent.playerManager.webView?.reload()
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                sender.endRefreshing()
            }
        }
        
        // Handle JS bridge messages
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "focusTubeAudio",
                  let body = message.body as? [String: Any] else { return }
            
            let eventType = body["type"] as? String ?? ""
            
            if eventType == "mediaState" {
                let title = body["title"] as? String ?? "FocusTube"
                let artist = body["artist"] as? String ?? "YouTube"
                let artwork = body["artwork"] as? String ?? ""
                let state = body["state"] as? String ?? "playing"
                let isPlaying = state == "playing"
                
                BackgroundPlayerManager.shared.updateNowPlaying(
                    title: title,
                    artist: artist,
                    duration: 0,
                    elapsed: 0,
                    artworkUrl: artwork,
                    playing: isPlaying
                )
                
                if isPlaying {
                    BackgroundPlayerManager.shared.startSilentAudioKeepAlive()
                }
            } else if eventType == "stateChange" {
                let state = body["state"] as? String ?? ""
                if state == "playing" {
                    BackgroundPlayerManager.shared.isPlaying = true
                    BackgroundPlayerManager.shared.startSilentAudioKeepAlive()
                } else {
                    BackgroundPlayerManager.shared.isPlaying = false
                }
            }
        }
        
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.isLoading = true
                self.parent.canGoBack = webView.canGoBack
                self.parent.canGoForward = webView.canGoForward
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.isLoading = false
                self.parent.canGoBack = webView.canGoBack
                self.parent.canGoForward = webView.canGoForward
                webView.scrollView.refreshControl?.endRefreshing()
            }
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            DispatchQueue.main.async {
                self.parent.isLoading = false
                webView.scrollView.refreshControl?.endRefreshing()
            }
        }
        
        // Handle popups / target="_blank" links
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if navigationAction.targetFrame == nil {
                webView.load(navigationAction.request)
            }
            return nil
        }
    }
}
