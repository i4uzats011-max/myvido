import Foundation
import AVFoundation
import MediaPlayer
import WebKit

/**
 * BackgroundPlayerManager:
 * Handles native iOS background audio session, lock screen controls (MPRemoteCommandCenter),
 * Now Playing info (MPNowPlayingInfoCenter), and keeps playback alive when the iPhone screen is locked.
 */
final class BackgroundPlayerManager: NSObject, ObservableObject {
    static let shared = BackgroundPlayerManager()
    
    @Published var isPlaying: Bool = false
    @Published var currentTitle: String = "FocusTube"
    @Published var currentArtist: String = "Distraction-Free YouTube"
    @Published var currentThumbnailUrl: String = ""
    @Published var duration: Double = 0.0
    @Published var currentTime: Double = 0.0
    @Published var isBackgroundActive: Bool = false
    
    private var silentAudioPlayer: AVAudioPlayer?
    private var backgroundTask: UIBackgroundTaskIdentifier = .invalid
    weak var webView: WKWebView?
    
    override init() {
        super.init()
        setupAudioSession()
        setupRemoteCommands()
        setupNotifications()
    }
    
    // MARK: - 1. Configure Native iOS Audio Session
    func setupAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .moviePlayback, options: [.allowAirPlay, .allowBluetooth, .mixWithOthers])
            try session.setActive(true)
            print("[FocusTube iOS] Audio session configured for background playback.")
        } catch {
            print("[FocusTube iOS] Audio session configuration failed: \(error.localizedDescription)")
        }
    }
    
    // MARK: - 2. Setup iOS Lock Screen Controls (MPRemoteCommandCenter)
    func setupRemoteCommands() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        // Play command
        commandCenter.playCommand.isEnabled = true
        commandCenter.playCommand.addTarget { [weak self] _ in
            self?.resumePlayback()
            return .success
        }
        
        // Pause command
        commandCenter.pauseCommand.isEnabled = true
        commandCenter.pauseCommand.addTarget { [weak self] _ in
            self?.pausePlayback()
            return .success
        }
        
        // Toggle Play/Pause
        commandCenter.togglePlayPauseCommand.isEnabled = true
        commandCenter.togglePlayPauseCommand.addTarget { [weak self] _ in
            guard let self = self else { return .commandFailed }
            if self.isPlaying {
                self.pausePlayback()
            } else {
                self.resumePlayback()
            }
            return .success
        }
        
        // Skip backward 10 seconds
        commandCenter.skipBackwardCommand.isEnabled = true
        commandCenter.skipBackwardCommand.preferredIntervals = [10]
        commandCenter.skipBackwardCommand.addTarget { [weak self] _ in
            self?.seekRelative(seconds: -10)
            return .success
        }
        
        // Skip forward 10 seconds
        commandCenter.skipForwardCommand.isEnabled = true
        commandCenter.skipForwardCommand.preferredIntervals = [10]
        commandCenter.skipForwardCommand.addTarget { [weak self] _ in
            self?.seekRelative(seconds: 10)
            return .success
        }
        
        // Scrubbing on lock screen
        commandCenter.changePlaybackPositionCommand.isEnabled = true
        commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let posEvent = event as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
            self?.seekTo(seconds: posEvent.positionTime)
            return .success
        }
    }
    
    // MARK: - 3. Update iOS Lock Screen & Control Center (MPNowPlayingInfoCenter)
    func updateNowPlaying(
        title: String,
        artist: String,
        duration: Double,
        elapsed: Double,
        artworkUrl: String? = nil,
        playing: Bool = true
    ) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.currentTitle = title.isEmpty ? "FocusTube" : title
            self.currentArtist = artist.isEmpty ? "YouTube Stream" : artist
            self.duration = duration
            self.currentTime = elapsed
            self.isPlaying = playing
            
            var nowPlayingInfo: [String: Any] = [
                MPMediaItemPropertyTitle: self.currentTitle,
                MPMediaItemPropertyArtist: self.currentArtist,
                MPNowPlayingInfoPropertyElapsedPlaybackTime: elapsed,
                MPNowPlayingInfoPropertyPlaybackRate: playing ? 1.0 : 0.0
            ]
            
            if duration > 0 {
                nowPlayingInfo[MPMediaItemPropertyPlaybackDuration] = duration
            }
            
            MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
            
            // Fetch artwork thumbnail asynchronously
            if let artworkUrl = artworkUrl, !artworkUrl.isEmpty, let url = URL(string: artworkUrl) {
                self.currentThumbnailUrl = artworkUrl
                URLSession.shared.dataTask(with: url) { data, _, _ in
                    if let data = data, let image = UIImage(data: data) {
                        DispatchQueue.main.async {
                            var current = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
                            let artwork = MPMediaItemArtwork(boundsSize: image.size) { _ in image }
                            current[MPMediaItemPropertyArtwork] = artwork
                            MPNowPlayingInfoCenter.default().nowPlayingInfo = current
                        }
                    }
                }.resume()
            }
        }
    }
    
    // MARK: - 4. Controls dispatched to WebView
    func resumePlayback() {
        DispatchQueue.main.async { [weak self] in
            self?.isPlaying = true
            self?.startSilentAudioKeepAlive()
            let js = """
            (function() {
                var iframes = document.querySelectorAll('iframe');
                iframes.forEach(function(f) {
                    try {
                        f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
                    } catch(e) {}
                });
                var media = document.querySelectorAll('video, audio');
                media.forEach(function(m) { m.play().catch(function(){}); });
            })();
            """
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
            self?.updateNowPlaying(
                title: self?.currentTitle ?? "FocusTube",
                artist: self?.currentArtist ?? "FocusTube",
                duration: self?.duration ?? 0,
                elapsed: self?.currentTime ?? 0,
                playing: true
            )
        }
    }
    
    func pausePlayback() {
        DispatchQueue.main.async { [weak self] in
            self?.isPlaying = false
            self?.stopSilentAudioKeepAlive()
            let js = """
            (function() {
                var iframes = document.querySelectorAll('iframe');
                iframes.forEach(function(f) {
                    try {
                        f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
                    } catch(e) {}
                });
                var media = document.querySelectorAll('video, audio');
                media.forEach(function(m) { m.pause(); });
            })();
            """
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
            self?.updateNowPlaying(
                title: self?.currentTitle ?? "FocusTube",
                artist: self?.currentArtist ?? "FocusTube",
                duration: self?.duration ?? 0,
                elapsed: self?.currentTime ?? 0,
                playing: false
            )
        }
    }
    
    func seekTo(seconds: Double) {
        DispatchQueue.main.async { [weak self] in
            self?.currentTime = seconds
            let js = """
            (function() {
                var iframes = document.querySelectorAll('iframe');
                iframes.forEach(function(f) {
                    try {
                        f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [\(seconds), true] }), '*');
                    } catch(e) {}
                });
                var media = document.querySelectorAll('video, audio');
                media.forEach(function(m) { m.currentTime = \(seconds); });
            })();
            """
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }
    
    func seekRelative(seconds: Double) {
        let newTime = max(0, currentTime + seconds)
        seekTo(seconds: newTime)
    }
    
    // MARK: - 5. Silent Audio Anchor for Screen-Off Playback
    func startSilentAudioKeepAlive() {
        guard FocusTubeConfig.enableBackgroundAudio else { return }
        if silentAudioPlayer == nil {
            silentAudioPlayer = createSilentAudioPlayer()
        }
        if silentAudioPlayer?.isPlaying == false {
            silentAudioPlayer?.play()
            print("[FocusTube iOS] Background silent audio anchor activated.")
        }
    }
    
    func stopSilentAudioKeepAlive() {
        silentAudioPlayer?.pause()
    }
    
    private func createSilentAudioPlayer() -> AVAudioPlayer? {
        // Generates minimal inaudible 1-second 8kHz WAV buffer
        let sampleRate: Double = 8000.0
        let duration: Double = 1.0
        let frameCount = Int(sampleRate * duration)
        
        var header = [UInt8]()
        let totalDataLen = frameCount * 2
        let totalFileLen = totalDataLen + 36
        
        header += [0x52, 0x49, 0x46, 0x46] // "RIFF"
        header += withUnsafeBytes(of: UInt32(totalFileLen).littleEndian) { Array($0) }
        header += [0x57, 0x41, 0x56, 0x45] // "WAVE"
        header += [0x66, 0x6D, 0x74, 0x20] // "fmt "
        header += [0x10, 0x00, 0x00, 0x00] // Subchunk1Size = 16
        header += [0x01, 0x00]             // AudioFormat = 1 (PCM)
        header += [0x01, 0x00]             // NumChannels = 1
        header += withUnsafeBytes(of: UInt32(sampleRate).littleEndian) { Array($0) }
        header += withUnsafeBytes(of: UInt32(sampleRate * 2).littleEndian) { Array($0) }
        header += [0x02, 0x00]             // BlockAlign = 2
        header += [0x10, 0x00]             // BitsPerSample = 16
        header += [0x64, 0x61, 0x74, 0x61] // "data"
        header += withUnsafeBytes(of: UInt32(totalDataLen).littleEndian) { Array($0) }
        
        let silentPcm = [UInt8](repeating: 0, count: totalDataLen)
        let fullData = Data(header + silentPcm)
        
        do {
            let player = try AVAudioPlayer(data: fullData)
            player.numberOfLoops = -1 // Loop indefinitely
            player.volume = 0.0001    // Near zero volume, keeps audio route active
            player.prepareToPlay()
            return player
        } catch {
            print("[FocusTube iOS] Failed to init silent audio player: \(error)")
            return nil
        }
    }
    
    // MARK: - 6. Background Lifecycle
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleWillEnterForeground),
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )
    }
    
    @objc private func handleDidEnterBackground() {
        isBackgroundActive = true
        if isPlaying {
            startSilentAudioKeepAlive()
            // Keep background task alive
            backgroundTask = UIApplication.shared.beginBackgroundTask(withName: "FocusTubeAudioTask") { [weak self] in
                if let task = self?.backgroundTask, task != .invalid {
                    UIApplication.shared.endBackgroundTask(task)
                    self?.backgroundTask = .invalid
                }
            }
        }
    }
    
    @objc private func handleWillEnterForeground() {
        isBackgroundActive = false
        if backgroundTask != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
    }
}
