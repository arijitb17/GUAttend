"""
PTZ Camera Control for Logitech PTZ Pro 2
Handles automatic pan, tilt, zoom for systematic classroom scanning
"""

import cv2
import time
from typing import List, Dict
import logging
import os

from pywinauto import Application, timings
import pyautogui  # make sure: pip install pyautogui

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# PATH TO PTZControl.exe  (CHANGE IF NEEDED)
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
PTZCONTROL_EXE = r"E:\PTZControl.exe"

# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# SCREEN COORDINATES OF PRESET BUTTONS IN PTZControl
# Filled from your get_pos.py output
# IMPORTANT: Keep PTZControl window in the same position every time.
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
PRESET_COORDS = {
    1: (963, 528),  # preset 1 - e.g. full wide view
    2: (980, 528),  # preset 2 - e.g. mid benches
    3: (960, 554),  # preset 3 - e.g. back benches
    4: (983, 554),  # preset 4 - optional extra region
    # You can add more if needed:
    # 5: (995, 555),
    # 6: (1018, 556),
    # 7: (960, 582),
    # 8: (976, 583),
}


def ensure_ptzcontrol_running() -> Application:
    """
    Start PTZControl if not running, then return a pywinauto Application object.

    Uses UI Automation (uia backend) so 64-bit Python can control 32-bit apps.
    """
    timings.after_clickinput_wait = 0.2

    # Try to connect if already running
    try:
        app = Application(backend="uia").connect(path=PTZCONTROL_EXE)
        return app
    except Exception:
        pass

    if not os.path.exists(PTZCONTROL_EXE):
        raise FileNotFoundError(f"PTZControl.exe not found at: {PTZCONTROL_EXE}")

    logger.info("Starting PTZControl.exe...")
    # Start the app using uia backend
    app = Application(backend="uia").start(PTZCONTROL_EXE)
    # Give it some time to create the UI
    time.sleep(3)

    # Ensure we can connect again (by path)
    app = Application(backend="uia").connect(path=PTZCONTROL_EXE)
    return app


def ptz_recall_preset(preset: int, camera_index: int = 1):
    """
    Recall a Logitech preset via PTZControl by:
      1. Focusing the PTZControl window
      2. Moving the mouse to the preset button coordinates
      3. Clicking it

    - preset: preset number stored in PTZControl
    - camera_index: not used by this method (single camera assumed), kept for API compatibility
    """
    if preset < 1:
        raise ValueError("preset must be >= 1")

    if preset not in PRESET_COORDS:
        logger.error(
            f"PRESET_COORDS for preset {preset} is not set. "
            f"Please edit ptz_control.py and fill real screen coordinates."
        )
        return

    x, y = PRESET_COORDS[preset]

    app = ensure_ptzcontrol_running()

    # Try to find a reasonable window; fallback to top_window()
    try:
        win = app.window(title_re=".*PTZ.*")
        _ = win.element_info  # force resolution
    except Exception:
        win = app.top_window()

    # Bring PTZControl to the foreground so clicks go to the right window
    try:
        win.set_focus()
    except Exception as e:
        logger.warning(f"Could not set focus to PTZControl window: {e}")

    logger.info(f"Recalling PTZ preset {preset} at screen coords ({x}, {y})")

    # Move mouse & click
    pyautogui.moveTo(x, y, duration=0.2)
    pyautogui.click()
    time.sleep(0.8)  # give camera time to start moving


class PTZController:
    """Controller for Logitech PTZ Pro 2 camera operations"""
    
    def __init__(self, camera_index=0, ptz_camera_index_in_app: int = 1):
        """
        Initialize PTZ controller
        
        Args:
            camera_index: Camera device index (usually 0 for first camera)
            ptz_camera_index_in_app: not used by pyautogui method, kept for API compatibility
        """
        self.camera_index = camera_index
        self.ptz_camera_index_in_app = ptz_camera_index_in_app
        self.cap = None
        
        # PTZ limits (metadata only; real movement done via PTZControl presets)
        self.pan_range = (-170, 170)  # degrees
        self.tilt_range = (-30, 30)   # degrees
        self.zoom_range = (100, 500)  # 1x to 5x zoom (percentage)
        
        # Current position (metadata)
        self.current_pan = 0
        self.current_tilt = 0
        self.current_zoom = 100
        
        # Delays (seconds)
        self.pan_delay = 0.5
        self.tilt_delay = 0.5
        self.zoom_delay = 1.0
        self.stabilization_delay = 1.5  # Wait after movement for image stabilization
        
    def initialize(self) -> bool:
        """Initialize camera connection using DirectShow (Windows)"""
        try:
            logger.info(f"Opening camera_index={self.camera_index} with DirectShow (CAP_DSHOW)...")

            # Use DirectShow explicitly to avoid CAP_ANY / MSMF hangs
            self.cap = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)

            if not self.cap.isOpened():
                logger.error(
                    f"Failed to open camera at index {self.camera_index} with DirectShow. "
                    f"Is the camera in use by another app?"
                )
                return False

            # Warm-up: try to read a few frames
            ret, frame = None, None
            for _ in range(10):
                ret, frame = self.cap.read()
                if ret and frame is not None:
                    break
                time.sleep(0.1)

            if not ret or frame is None:
                logger.error("Camera opened but failed to read any frames during warm-up")
                self.cap.release()
                self.cap = None
                return False

            # Set high resolution (best effort)
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
            self.cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)

            logger.info("PTZ camera initialized successfully (video only)")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize camera: {e}")
            return False

    
    def recall_preset(self, preset: int):
        """Move the hardware camera to a preset position using PTZControl.exe."""
        ptz_recall_preset(preset, camera_index=self.ptz_camera_index_in_app)

    def reset_position(self, home_preset: int = 1):
        """Reset camera to a 'home' preset position (default preset 1)."""
        logger.info(f"Resetting camera to home preset {home_preset}")
        self.recall_preset(home_preset)
        time.sleep(self.stabilization_delay)
    
    # ------------ Frame capture -----------------------------------------
    def capture_frame(self) -> 'cv2.Mat':
        """Capture a single frame from the video stream."""
        if self.cap is None:
            logger.warning("capture_frame called but camera is not initialized")
            return None
        
        # Wait for stabilization after preset move
        time.sleep(self.stabilization_delay)
        
        ret, frame = self.cap.read()
        
        if not ret or frame is None:
            logger.error("Failed to capture frame")
            return None
        
        return frame

    # ------------ Multi-preset scan (Option 2) --------------------------
    def scan_multi_presets(self, presets: List[int]) -> List[Dict]:
        """
        Capture frames at several PTZ presets and return all frames with metadata.

        Example:
            presets = [1, 2, 3]  # wide, mid, back

        Returns:
            List of dicts: { "frame", "preset", "timestamp" }
        """
        captures: List[Dict] = []
        logger.info(f"Starting multi-preset scan: presets={presets}")

        for idx, preset in enumerate(presets, start=1):
            logger.info(f"[{idx}/{len(presets)}] Moving to preset {preset}")
            self.recall_preset(preset)

            frame = self.capture_frame()
            if frame is not None:
                captures.append({
                    "frame": frame,
                    "preset": preset,
                    "timestamp": time.time(),
                })
                logger.info(f"✓ Captured frame at preset {preset}")
            else:
                logger.warning(f"✗ Failed to capture at preset {preset}")

        logger.info(f"Multi-preset scan complete: {len(captures)}/{len(presets)} frames captured")
        return captures
    
    def release(self):
        """Release camera resources"""
        if self.cap is not None:
            try:
                self.reset_position(home_preset=1)
            except Exception:
                pass
            self.cap.release()
            self.cap = None
            logger.info("Camera released")


def live_preview(controller: PTZController, duration: float = 3.0, window_name: str = "PTZ Live Preview"):
    """
    Show a live preview from the PTZ camera for a few seconds.
    Press ESC to exit early.
    """
    if controller.cap is None:
        print("Camera not initialized")
        return

    start = time.time()
    while time.time() - start < duration:
        ret, frame = controller.cap.read()
        if not ret or frame is None:
            print("Failed to read frame")
            break

        cv2.imshow(window_name, frame)
        if cv2.waitKey(30) & 0xFF == 27:
            break


# Example usage and testing
if __name__ == "__main__":
    controller = PTZController(camera_index=0, ptz_camera_index_in_app=1)

    if controller.initialize():
        print("Camera initialized successfully!")

        cv2.namedWindow("PTZ Live Preview", cv2.WINDOW_NORMAL)

        # Test individual presets with preview
        print("\nGoing to HOME preset (1)...")
        controller.recall_preset(1)
        live_preview(controller, duration=4, window_name="PTZ Live Preview")

        print("\nGoing to preset 2...")
        controller.recall_preset(2)
        live_preview(controller, duration=4, window_name="PTZ Live Preview")

        print("\nGoing to preset 3...")
        controller.recall_preset(3)
        live_preview(controller, duration=4, window_name="PTZ Live Preview")

        # Option 2: multi-preset scan (wide + mid + back, for example)
        print("\nStarting multi-preset scan (1=wide, 2=mid, 3=back)...")
        captures = controller.scan_multi_presets(presets=[1, 2, 3])
        print(f"Captured {len(captures)} frames from multi-preset scan")

        controller.release()
        cv2.destroyAllWindows()
        print("\nPTZ test complete!")
    else:
        print("Failed to initialize camera")
