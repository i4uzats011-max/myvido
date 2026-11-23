import SwiftUI

struct ContentView: View {
    @ObservedObject var playerManager = BackgroundPlayerManager.shared
    @State private var isLoading: Bool = false
    @State private var canGoBack: Bool = false
    @State private var canGoForward: Bool = false
    @State private var showSettings: Bool = false
    @State private var currentAppUrl: String = FocusTubeConfig.currentUrl
    @State private var urlDraft: String = FocusTubeConfig.currentUrl
    @State private var reloadKey: UUID = UUID()
    
    var body: some View {
        ZStack(alignment: .bottom) {
            Color(red: 15/255, green: 15/255, blue: 15/255)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Top Native Status Bar Header (Dark Zen Mode)
                HStack {
                    HStack(spacing: 6) {
                        Image(systemName: "shield.checkerboard")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.red)
                        Text("FocusTube")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    // Background Audio Status Badge
                    HStack(spacing: 4) {
                        Circle()
                            .fill(playerManager.isPlaying ? Color.green : Color.orange)
                            .frame(width: 6, height: 6)
                        Text(playerManager.isPlaying ? "Audio Active" : "Zen Mode")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.neutral300)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.white.opacity(0.08))
                    .cornerRadius(12)
                    
                    // Settings Button
                    Button(action: {
                        urlDraft = currentAppUrl
                        showSettings = true
                    }) {
                        Image(systemName: "gearshape")
                            .font(.system(size: 14))
                            .foregroundColor(.neutral300)
                            .padding(6)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color(red: 18/255, green: 18/255, blue: 18/255))
                
                // Progress Bar while web page is loading
                if isLoading {
                    ProgressView()
                        .progressViewStyle(LinearProgressViewStyle(tint: .red))
                        .frame(height: 2)
                }
                
                // Main WKWebView with injected background audio bridge
                FocusTubeWebView(
                    isLoading: $isLoading,
                    canGoBack: $canGoBack,
                    canGoForward: $canGoForward,
                    targetUrl: URL(string: currentAppUrl) ?? URL(string: FocusTubeConfig.defaultAppUrl)!
                )
                .id(reloadKey)
                
                // Native Mini Player Bar (Visible when audio/video is playing)
                if playerManager.isPlaying || !playerManager.currentTitle.isEmpty && playerManager.currentTitle != "FocusTube" {
                    HStack(spacing: 12) {
                        Image(systemName: "headphones")
                            .font(.system(size: 16))
                            .foregroundColor(.red)
                            .padding(8)
                            .background(Color.red.opacity(0.15))
                            .clipShape(Circle())
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(playerManager.currentTitle)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Text(playerManager.currentArtist)
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                                .lineLimit(1)
                        }
                        
                        Spacer()
                        
                        // Native Play / Pause Trigger
                        Button(action: {
                            if playerManager.isPlaying {
                                playerManager.pausePlayback()
                            } else {
                                playerManager.resumePlayback()
                            }
                        }) {
                            Image(systemName: playerManager.isPlaying ? "pause.fill" : "play.fill")
                                .font(.system(size: 16))
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.white.opacity(0.12))
                                .clipShape(Circle())
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(Color(red: 24/255, green: 24/255, blue: 24/255))
                    .cornerRadius(12)
                    .padding(.horizontal, 10)
                    .padding(.bottom, 6)
                    .shadow(color: Color.black.opacity(0.4), radius: 6, y: -2)
                }
            }
        }
        .sheet(isPresented: $showSettings) {
            NavigationView {
                Form {
                    Section(header: Text("Server Connection")) {
                        TextField("App URL (e.g. https://focustube.vercel.app)", text: $urlDraft)
                            .textInputAutocapitalization(.never)
                            .disableAutocorrection(true)
                            .keyboardType(.URL)
                        
                        Text("Current: \(currentAppUrl)")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    
                    Section(header: Text("iOS Background Audio")) {
                        Toggle("Continuous Screen-Off Playback", isOn: Binding(
                            get: { FocusTubeConfig.enableBackgroundAudio },
                            set: { FocusTubeConfig.enableBackgroundAudio = $0 }
                        ))
                        
                        Text("When enabled, audio continues playing when iPhone screen turns off or when using other apps.")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    
                    Section {
                        Button("Save & Reload") {
                            if let validUrl = URL(string: urlDraft), !urlDraft.isEmpty {
                                FocusTubeConfig.currentUrl = urlDraft
                                currentAppUrl = urlDraft
                                reloadKey = UUID()
                            }
                            showSettings = false
                        }
                        .foregroundColor(.red)
                        .fontWeight(.bold)
                        
                        Button("Reset to Default URL") {
                            urlDraft = FocusTubeConfig.defaultAppUrl
                            FocusTubeConfig.currentUrl = FocusTubeConfig.defaultAppUrl
                            currentAppUrl = FocusTubeConfig.defaultAppUrl
                            reloadKey = UUID()
                            showSettings = false
                        }
                        .foregroundColor(.gray)
                    }
                }
                .navigationTitle("FocusTube iOS Settings")
                .navigationBarItems(trailing: Button("Done") {
                    showSettings = false
                })
            }
            .preferredColorScheme(.dark)
        }
    }
}

extension Color {
    static let neutral300 = Color(red: 212/255, green: 212/255, blue: 212/255)
}
