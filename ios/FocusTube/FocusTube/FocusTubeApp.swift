import SwiftUI
import AVFoundation

@main
struct FocusTubeApp: App {
    @Environment(\.scenePhase) private var scenePhase
    
    init() {
        // Initialize background audio session immediately on iOS startup
        BackgroundPlayerManager.shared.setupAudioSession()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
        }
        .onChange(of: scenePhase) { newPhase in
            switch newPhase {
            case .active:
                print("[FocusTube iOS] App is active")
            case .inactive:
                print("[FocusTube iOS] App is inactive")
            case .background:
                print("[FocusTube iOS] App entered background - keeping audio session alive")
                if BackgroundPlayerManager.shared.isPlaying {
                    BackgroundPlayerManager.shared.startSilentAudioKeepAlive()
                }
            @unknown default:
                break
            }
        }
    }
}
