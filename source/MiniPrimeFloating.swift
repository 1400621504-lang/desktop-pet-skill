import AppKit
import WebKit

let root = URL(fileURLWithPath: "/Users/apple/Documents/Codex/claude-mini-prime-pet")
let htmlURL = root.appendingPathComponent("floating.html")
let sessionId = CommandLine.arguments.dropFirst().first ?? "default"
let stateURL = root.appendingPathComponent("sessions").appendingPathComponent(sessionId).appendingPathComponent("state.json")

final class PetWebView: WKWebView {
    override var acceptsFirstResponder: Bool { true }
    private var dragStartMouse = NSPoint.zero
    private var dragStartOrigin = NSPoint.zero
    private var lastDragScreenX: CGFloat = 0

    private func writeDragState(_ state: String, label: String) {
        let payload = """
        {"state":"\(state)","label":"\(label)","detail":"Mini Prime is being moved.","event":"Drag","sessionId":"\(sessionId)","updatedAt":"\(ISO8601DateFormatter().string(from: Date()))"}
        """
        try? FileManager.default.createDirectory(at: stateURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        try? payload.write(to: stateURL, atomically: true, encoding: .utf8)
    }

    override func mouseDown(with event: NSEvent) {
        guard let window = window else { return }
        dragStartMouse = NSEvent.mouseLocation
        dragStartOrigin = window.frame.origin
        lastDragScreenX = dragStartMouse.x
        writeDragState("running", label: "Moving")
    }

    override func mouseDragged(with event: NSEvent) {
        guard let window = window else { return }
        let current = NSEvent.mouseLocation
        let dx = current.x - dragStartMouse.x
        let dy = current.y - dragStartMouse.y
        window.setFrameOrigin(NSPoint(x: dragStartOrigin.x + dx, y: dragStartOrigin.y + dy))

        let state = current.x >= lastDragScreenX ? "running-right" : "running-left"
        lastDragScreenX = current.x
        writeDragState(state, label: "Moving")
    }

    override func mouseUp(with event: NSEvent) {
        writeDragState("idle", label: "Ready")
    }

    override func keyDown(with event: NSEvent) {
        if event.keyCode == 53 || (event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "w") {
            NSApp.terminate(nil)
            return
        }
        super.keyDown(with: event)
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!
    private var timer: Timer?
    private var lastState = ""

    func applicationDidFinishLaunching(_ notification: Notification) {
        let config = WKWebViewConfiguration()
        webView = PetWebView(frame: .zero, configuration: config)
        webView.setValue(false, forKey: "drawsBackground")

        window = NSWindow(
            contentRect: NSRect(x: 920, y: 120, width: 420, height: 300),
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        window.isOpaque = false
        window.backgroundColor = .clear
        window.level = .floating
        window.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        window.hasShadow = false
        window.isMovableByWindowBackground = true
        window.ignoresMouseEvents = false
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)
        window.makeFirstResponder(webView)

        webView.loadFileURL(htmlURL, allowingReadAccessTo: root)

        timer = Timer.scheduledTimer(withTimeInterval: 0.35, repeats: true) { [weak self] _ in
            self?.pushState()
        }
    }

    private func pushState() {
        guard let data = try? Data(contentsOf: stateURL),
              let text = String(data: data, encoding: .utf8),
              text != lastState else {
            return
        }
        lastState = text
        let escaped = text
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "`", with: "\\`")
            .replacingOccurrences(of: "${", with: "\\${")
        webView.evaluateJavaScript("window.setMiniPrimeState(JSON.parse(`\(escaped)`));", completionHandler: nil)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
