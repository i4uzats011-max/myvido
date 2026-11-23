import Foundation

struct FocusTubeConfig {
    // Default URL to load. Can be a deployed Vercel URL or local development server.
    static let defaultAppUrl = "https://focustube.vercel.app"
    
    // User configurable stored URL
    static var currentUrl: String {
        get {
            return UserDefaults.standard.string(forKey: "focustube_custom_url") ?? defaultAppUrl
        }
        set {
            UserDefaults.standard.set(newValue, forKey: "focustube_custom_url")
        }
    }
    
    // Enable continuous screen-off audio lock
    static var enableBackgroundAudio: Bool {
        get {
            return UserDefaults.standard.object(forKey: "focustube_bg_audio") as? Bool ?? true
        }
        set {
            UserDefaults.standard.set(newValue, forKey: "focustube_bg_audio")
        }
    }
    
    // Check if the current URL is valid
    static func getActiveURL() -> URL {
        if let customUrl = URL(string: currentUrl), !currentUrl.isEmpty {
            return customUrl
        }
        return URL(string: defaultAppUrl)!
    }
}
