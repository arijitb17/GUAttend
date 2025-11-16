# ptz_control.py
"""
PTZ Camera Control for Logitech PTZ Pro 2
Supports pan, tilt, zoom operations for classroom sections
"""

import cv2
import time
import numpy as np
from typing import List, Dict, Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PTZCameraController:
    """Control Logitech PTZ Pro 2 camera via UVC extensions"""
    
    # UVC Control IDs for PTZ
    UVC_CTRL_ZOOM_ABSOLUTE = 0x9A0B0B
    UVC_CTRL_PAN_ABSOLUTE = 0x9A0D0B
    UVC_CTRL_TILT_ABSOLUTE = 0x9A0E0B
    UVC_CTRL_FOCUS_ABSOLUTE = 0x9A0A0B
    
    def __init__(self, camera_index: int = 0):
        """Initialize PTZ camera controller
        
        Args:
            camera_index: Index of the camera device (default: 0)
        """
        self.camera_index = camera_index
        self.cap = None
        self.current_preset = None
        
        # Logitech PTZ Pro 2 zoom range: 100 (wide) to 1000 (10x tele)
        self.zoom_min = 100
        self.zoom_max = 1000
        
        # Pan range: -36000 to 36000 (hundredths of degree)
        self.pan_min = -36000
        self.pan_max = 36000
        
        # Tilt range: -36000 to 36000
        self.tilt_min = -20000
        self.tilt_max = 20000
        
    def connect(self) -> bool:
        """Connect to the PTZ camera"""
        try:
            self.cap = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)  # Windows
            # For Linux, use: cv2.VideoCapture(self.camera_index, cv2.CAP_V4L2)
            
            if not self.cap.isOpened():
                logger.error("Failed to open camera")
                return False
            
            # Set high resolution for better quality
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
            self.cap.set(cv2.CAP_PROP_AUTOFOCUS, 0)  # Disable autofocus
            
            logger.info(f"Connected to PTZ camera at index {self.camera_index}")
            return True
            
        except Exception as e:
            logger.error(f"Camera connection failed: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from camera"""
        if self.cap:
            self.cap.release()
            logger.info("Camera disconnected")
    
    def set_zoom(self, zoom_level: int, wait: float = 1.0) -> bool:
        """Set camera zoom level
        
        Args:
            zoom_level: Zoom value (100=wide, 1000=10x telephoto)
            wait: Time to wait for zoom to complete (seconds)
        """
        try:
            zoom_level = max(self.zoom_min, min(self.zoom_max, zoom_level))
            self.cap.set(cv2.CAP_PROP_ZOOM, zoom_level)
            time.sleep(wait)  # Wait for mechanical movement
            logger.info(f"Zoom set to {zoom_level}")
            return True
        except Exception as e:
            logger.error(f"Zoom control failed: {e}")
            return False
    
    def set_pan_tilt(self, pan: int, tilt: int, wait: float = 1.5) -> bool:
        """Set camera pan and tilt position
        
        Args:
            pan: Pan angle in hundredths of degree (-36000 to 36000)
            tilt: Tilt angle in hundredths of degree (-20000 to 20000)
            wait: Time to wait for movement to complete (seconds)
        """
        try:
            pan = max(self.pan_min, min(self.pan_max, pan))
            tilt = max(self.tilt_min, min(self.tilt_max, tilt))
            
            self.cap.set(cv2.CAP_PROP_PAN, pan)
            self.cap.set(cv2.CAP_PROP_TILT, tilt)
            time.sleep(wait)  # Wait for mechanical movement
            
            logger.info(f"Pan/Tilt set to ({pan}, {tilt})")
            return True
        except Exception as e:
            logger.error(f"Pan/Tilt control failed: {e}")
            return False
    
    def capture_frame(self) -> Optional[np.ndarray]:
        """Capture a single frame from camera"""
        if not self.cap or not self.cap.isOpened():
            logger.error("Camera not connected")
            return None
        
        ret, frame = self.cap.read()
        if not ret:
            logger.error("Failed to capture frame")
            return None
        
        return frame
    
    def go_to_preset(self, preset_name: str, presets: Dict) -> bool:
        """Move camera to a predefined preset position
        
        Args:
            preset_name: Name of the preset (e.g., 'front', 'middle', 'back')
            presets: Dictionary of preset configurations
        """
        if preset_name not in presets:
            logger.error(f"Preset '{preset_name}' not found")
            return False
        
        preset = presets[preset_name]
        
        success = True
        if 'zoom' in preset:
            success &= self.set_zoom(preset['zoom'], wait=1.0)
        
        if 'pan' in preset and 'tilt' in preset:
            success &= self.set_pan_tilt(preset['pan'], preset['tilt'], wait=1.5)
        
        if success:
            self.current_preset = preset_name
            logger.info(f"Moved to preset: {preset_name}")
        
        return success
    
    def reset_to_home(self) -> bool:
        """Reset camera to home position (center, wide angle)"""
        return self.go_to_preset('home', {
            'home': {'pan': 0, 'tilt': 0, 'zoom': 100}
        })


class ClassroomSectionCapture:
    """Capture images of different classroom sections using PTZ camera"""
    
    def __init__(self, ptz_controller: PTZCameraController):
        self.ptz = ptz_controller
        
        # Define classroom sections (customize based on your classroom layout)
        self.section_presets = {
            'front_left': {
                'pan': -15000,  # Look left
                'tilt': 2000,   # Slight down tilt
                'zoom': 200,    # 2x zoom
                'description': 'Front left section (rows 1-2)'
            },
            'front_center': {
                'pan': 0,       # Center
                'tilt': 2000,
                'zoom': 200,
                'description': 'Front center section (rows 1-2)'
            },
            'front_right': {
                'pan': 15000,   # Look right
                'tilt': 2000,
                'zoom': 200,
                'description': 'Front right section (rows 1-2)'
            },
            'middle_left': {
                'pan': -12000,
                'tilt': 0,
                'zoom': 400,    # 4x zoom
                'description': 'Middle left section (rows 3-4)'
            },
            'middle_center': {
                'pan': 0,
                'tilt': 0,
                'zoom': 400,
                'description': 'Middle center section (rows 3-4)'
            },
            'middle_right': {
                'pan': 12000,
                'tilt': 0,
                'zoom': 400,
                'description': 'Middle right section (rows 3-4)'
            },
            'back_left': {
                'pan': -10000,
                'tilt': -2000,  # Look up slightly
                'zoom': 700,    # 7x zoom
                'description': 'Back left section (rows 5+)'
            },
            'back_center': {
                'pan': 0,
                'tilt': -2000,
                'zoom': 700,
                'description': 'Back center section (rows 5+)'
            },
            'back_right': {
                'pan': 10000,
                'tilt': -2000,
                'zoom': 700,
                'description': 'Back right section (rows 5+)'
            },
            'overview': {
                'pan': 0,
                'tilt': 0,
                'zoom': 100,    # Wide angle
                'description': 'Full classroom overview'
            }
        }
    
    def capture_all_sections(
        self, 
        sections: Optional[List[str]] = None,
        frames_per_section: int = 3,
        stabilization_delay: float = 2.0
    ) -> Dict[str, List[np.ndarray]]:
        """Capture frames from multiple classroom sections
        
        Args:
            sections: List of section names to capture (None = all sections)
            frames_per_section: Number of frames to capture per section
            stabilization_delay: Extra delay after movement for image stabilization
        
        Returns:
            Dictionary mapping section names to lists of captured frames
        """
        if sections is None:
            sections = list(self.section_presets.keys())
        
        captured_frames = {}
        
        for section in sections:
            if section not in self.section_presets:
                logger.warning(f"Unknown section: {section}")
                continue
            
            logger.info(f"Capturing section: {section}")
            logger.info(f"  {self.section_presets[section]['description']}")
            
            # Move to section
            if not self.ptz.go_to_preset(section, self.section_presets):
                logger.error(f"Failed to move to section: {section}")
                continue
            
            # Extra stabilization delay
            time.sleep(stabilization_delay)
            
            # Capture multiple frames
            section_frames = []
            for i in range(frames_per_section):
                frame = self.ptz.capture_frame()
                if frame is not None:
                    section_frames.append(frame)
                    logger.info(f"  Captured frame {i+1}/{frames_per_section}")
                time.sleep(0.3)  # Small delay between frames
            
            captured_frames[section] = section_frames
        
        # Return to overview position
        self.ptz.go_to_preset('overview', self.section_presets)
        
        logger.info(f"Capture complete: {len(captured_frames)} sections")
        return captured_frames
    
    def get_section_info(self) -> Dict[str, Dict]:
        """Get information about all defined sections"""
        return self.section_presets.copy()


# Example usage and testing
def test_ptz_control():
    """Test PTZ camera control"""
    print("Initializing PTZ Camera Controller...")
    
    ptz = PTZCameraController(camera_index=0)
    
    if not ptz.connect():
        print("Failed to connect to camera")
        return
    
    try:
        # Test zoom levels
        print("\nTesting zoom levels...")
        for zoom in [100, 300, 500, 700, 1000]:
            print(f"Setting zoom to {zoom}...")
            ptz.set_zoom(zoom, wait=2.0)
            frame = ptz.capture_frame()
            if frame is not None:
                cv2.imshow(f"Zoom {zoom}", frame)
                cv2.waitKey(1000)
        
        # Test pan/tilt
        print("\nTesting pan/tilt...")
        positions = [
            (-15000, 5000, "Left"),
            (0, 5000, "Center"),
            (15000, 5000, "Right"),
            (0, -5000, "Up"),
        ]
        
        for pan, tilt, desc in positions:
            print(f"Moving to: {desc}")
            ptz.set_pan_tilt(pan, tilt, wait=2.0)
            frame = ptz.capture_frame()
            if frame is not None:
                cv2.imshow(f"Position: {desc}", frame)
                cv2.waitKey(1000)
        
        # Reset to home
        print("\nResetting to home position...")
        ptz.reset_to_home()
        
    finally:
        cv2.destroyAllWindows()
        ptz.disconnect()
    
    print("\nTest complete!")


def demo_classroom_capture():
    """Demonstrate classroom section capture"""
    print("Initializing Classroom Section Capture...")
    
    ptz = PTZCameraController(camera_index=0)
    
    if not ptz.connect():
        print("Failed to connect to camera")
        return
    
    try:
        classroom = ClassroomSectionCapture(ptz)
        
        # Show available sections
        print("\nAvailable sections:")
        for name, info in classroom.get_section_info().items():
            print(f"  {name}: {info['description']}")
        
        # Capture specific sections (customize as needed)
        sections_to_capture = [
            'front_center',
            'middle_center', 
            'back_center'
        ]
        
        print(f"\nCapturing {len(sections_to_capture)} sections...")
        captured = classroom.capture_all_sections(
            sections=sections_to_capture,
            frames_per_section=3,
            stabilization_delay=2.0
        )
        
        # Display results
        for section, frames in captured.items():
            print(f"\nSection '{section}': {len(frames)} frames captured")
            for i, frame in enumerate(frames):
                cv2.imshow(f"{section} - Frame {i+1}", frame)
        
        cv2.waitKey(0)
        
    finally:
        cv2.destroyAllWindows()
        ptz.disconnect()
    
    print("\nDemo complete!")


if __name__ == "__main__":
    # Uncomment to run tests
    # test_ptz_control()
    demo_classroom_capture()