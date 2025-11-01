"use client"
 import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, User, Mail, Book, Calendar, Building, Loader } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  entryCode: string;
  teacher: {
    name: string;
    email: string;
  };
  semester: {
    name: string;
    academicYear: string;
  };
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  student: {
    id: string;
    program: {
      id: string;
      name: string;
      department: {
        id: string;
        name: string;
      };
    };
    courses: Course[];
    hasFaceEmbedding: boolean;
  };
}

interface Photos {
  front: File | null;
  left: File | null;
  right: File | null;
}

interface Previews {
  front: string | null;
  left: string | null;
  right: string | null;
}

type PoseKey = 'front' | 'left' | 'right';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const StudentProfilePage: React.FC = () => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasUploadedPhotos, setHasUploadedPhotos] = useState<boolean>(false);
  const [checkingPhotos, setCheckingPhotos] = useState<boolean>(false);

  const [photos, setPhotos] = useState<Photos>({
    front: null,
    left: null,
    right: null
  });

  const [previews, setPreviews] = useState<Previews>({
    front: null,
    left: null,
    right: null
  });

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const [activeCamera, setActiveCamera] = useState<PoseKey | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const poses: Array<{ key: PoseKey; label: string; instruction: string }> = [
    { key: 'front', label: 'Front View', instruction: 'Look straight at the camera' },
    { key: 'left', label: 'Left Profile', instruction: 'Turn your head to the left' },
    { key: 'right', label: 'Right Profile', instruction: 'Turn your head to the right' }
  ];

  // Fetch student data on mount
  useEffect(() => {
    fetchStudentData();
  }, []);

  // Check for uploaded photos
  useEffect(() => {
    if (student?.student?.id) {
      checkUploadedPhotos();
    }
  }, [student]);


  const fetchStudentData = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthError('No authentication token found. Please login.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/student/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch student data');
      }

      const data: StudentData = await response.json();
      setStudent(data);
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setAuthError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Check if photos exist in directory
  const checkUploadedPhotos = async (): Promise<void> => {
    if (!student?.student?.id) return;

    try {
      setCheckingPhotos(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/student/check-photos?studentId=${student.student.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHasUploadedPhotos(data.hasPhotos || false);
      }
    } catch (error) {
      console.error('Error checking photos:', error);
    } finally {
      setCheckingPhotos(false);
    }
  };

  // Start camera
  const startCamera = async (pose: PoseKey): Promise<void> => {
    try {
      setMessage('');
      setUploadStatus('idle');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      streamRef.current = stream;
      setActiveCamera(pose);
      
      // Wait for next frame to ensure videoRef is rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setMessage('Camera access denied. Please enable camera permissions.');
      setUploadStatus('error');
      setActiveCamera(null);
    }
  };

  // Stop camera
  const stopCamera = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setActiveCamera(null);
  };

  // Capture photo from camera
  const capturePhoto = (): void => {
    if (!videoRef.current || !activeCamera) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob || !activeCamera) return;
      const file = new File([blob], `${activeCamera}.jpg`, { type: 'image/jpeg' });
      handlePhotoSelect(activeCamera, file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  // Handle file upload
  const handleFileUpload = (pose: PoseKey, event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      handlePhotoSelect(pose, file);
    }
  };

  // Process selected photo
  const handlePhotoSelect = (pose: PoseKey, file: File): void => {
    setPhotos(prev => ({ ...prev, [pose]: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [pose]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const removePhoto = (pose: PoseKey): void => {
    setPhotos(prev => ({ ...prev, [pose]: null }));
    setPreviews(prev => ({ ...prev, [pose]: null }));
  };

  // Submit photos
  const handleSubmit = async (): Promise<void> => {
    if (!student) return;

    const uploadedPhotos = Object.values(photos).filter(p => p !== null);
    
    if (uploadedPhotos.length === 0) {
      setMessage('Please upload at least one photo');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setMessage('Uploading photos and processing face data...');

    const formData = new FormData();
    formData.append('studentId', student.student.id);
    
    Object.entries(photos).forEach(([pose, file]) => {
      if (file) {
        formData.append(pose, file);
      }
    });

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/student/upload-photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response. Please check if the API endpoint exists.');
      }

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setMessage(data.message || 'Photos uploaded successfully! Face processing started.');
        
        // Update student state immediately
        if (student) {
          setStudent({
            ...student,
            student: {
              ...student.student,
              hasFaceEmbedding: true
            }
          });
        }
        
        // Clear photos after successful upload
        setTimeout(() => {
          setPhotos({ front: null, left: null, right: null });
          setPreviews({ front: null, left: null, right: null });
          setUploadStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-white mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Auth error state
  if (authError) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Authentication Error</h2>
          <p className="text-gray-600 text-center mb-6">{authError}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

 return (
  <div className="min-h-screen p-6 text-white">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0e0e0e] rounded-lg shadow-lg p-6 mb-6 border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-4">Student Profile</h1>

        {/* Student Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="text-white/80" size={20} />
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="font-semibold text-white">{student.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="text-white/80" size={20} />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-semibold text-white">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Book className="text-white/80" size={20} />
            <div>
              <p className="text-sm text-gray-400">Program</p>
              <p className="font-semibold text-white">{student.student.program.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building className="text-white/80" size={20} />
            <div>
              <p className="text-sm text-gray-400">Department</p>
              <p className="font-semibold text-white">{student.student.program.department.name}</p>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        {student.student.courses.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">
              <Calendar size={18} />
              Enrolled Courses ({student.student.courses.length})
            </h3>
            <div className="bg-[#141414] rounded-lg p-3 space-y-2 border border-white/5">
              {student.student.courses.map((course) => (
                <div key={course.id} className="text-sm">
                  <p className="font-medium text-white">{course.name}</p>
                  <p className="text-gray-400">
                    {course.teacher.name} • {course.semester.name} ({course.semester.academicYear})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Face Recognition Status */}
        <div className="mt-4 p-4 bg-[#141414] rounded-lg border border-white/5">
          {checkingPhotos ? (
            <div className="flex items-center gap-2">
              <Loader className="animate-spin text-white/80" size={20} />
              <span className="text-gray-200 font-medium">Checking photo status...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {hasUploadedPhotos || student.student.hasFaceEmbedding ? (
                <>
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-green-300 font-medium">
                    {student.student.hasFaceEmbedding
                      ? "Face recognition enabled"
                      : "Face photos uploaded - Processing in progress"}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="text-yellow-400" size={20} />
                  <span className="text-yellow-300 font-medium">
                    Face recognition not set up - Upload photos below
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="bg-[#0e0e0e] rounded-lg shadow-lg p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">
          {hasUploadedPhotos || student.student.hasFaceEmbedding
            ? "Update Face Photos"
            : "Upload Face Photos"}
        </h2>
        <p className="text-gray-400 mb-6">
          Upload photos from three angles for accurate face recognition. You can either capture photos using your camera or upload existing images.
        </p>

        {/* Camera View */}
        {activeCamera && (
          <div className="mb-6 bg-black rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold">
                {poses.find((p) => p.key === activeCamera)?.label}
              </h3>
              <button
                onClick={stopCamera}
                className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Close Camera
              </button>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg mb-3 bg-black"
              style={{ maxHeight: "400px" }}
            />
            <p className="text-gray-400 text-sm mb-3">
              {poses.find((p) => p.key === activeCamera)?.instruction}
            </p>
            <button
              onClick={capturePhoto}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
            >
              Capture Photo
            </button>
          </div>
        )}

        {/* Photo Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {poses.map(({ key, label, instruction }) => (
            <div key={key} className="border-2 border-dashed border-white/10 rounded-lg p-4 bg-[#141414]">
              <h3 className="font-semibold text-white mb-2">{label}</h3>
              <p className="text-sm text-gray-400 mb-4">{instruction}</p>

              {previews[key] ? (
                <div className="relative">
                  <img
                    src={previews[key] || ""}
                    alt={label}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <button
                    onClick={() => removePhoto(key)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    ×
                  </button>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={16} />
                    <span className="text-sm">Photo ready</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => startCamera(key)}
                    disabled={activeCamera !== null}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Camera size={18} />
                    Use Camera
                  </button>
                  <label className="w-full bg-[#1a1a1a] hover:bg-[#222222] text-white py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer border border-white/5">
                    <Upload size={18} />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(key, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Status Message */}
        {message && uploadStatus !== "idle" && (
          <div
            className={`p-4 rounded-lg mb-4 ${
              uploadStatus === "success"
                ? "bg-green-900 text-green-100"
                : uploadStatus === "error"
                ? "bg-red-900 text-red-100"
                : uploadStatus === "uploading"
                ? "bg-blue-900 text-blue-100"
                : "bg-[#141414] text-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {uploadStatus === "success" && <CheckCircle size={20} />}
              {uploadStatus === "error" && <AlertCircle size={20} />}
              {uploadStatus === "uploading" && <Loader className="animate-spin" size={20} />}
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={uploadStatus === "uploading" || Object.values(photos).every((p) => p === null)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          {uploadStatus === "uploading" ? "Processing..." : "Submit Photos"}
        </button>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Your photos will be processed securely for the face recognition attendance system.
        </p>
      </div>
    </div>
  </div>
);
}

export default StudentProfilePage;