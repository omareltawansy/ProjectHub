import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../../components/Toast/Toast';
import './InstructorSettings.css';

export default function InstructorSettings({ user, onClose }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    profileInfo: user.profileInfo || '',
    profilePicture: user.profilePicture || '',
    bio: user.bio || '',
    specialization: user.specialization || '',
    officeHours: user.officeHours || '',
    linkedCourses: user.linkedCourses || []
  });

  const [profileImagePreview, setProfileImagePreview] = useState(user.profilePicture || '');
  const [newCourse, setNewCourse] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCourse = () => {
    if (newCourse.trim()) {
      setFormData(prev => ({
        ...prev,
        linkedCourses: [...prev.linkedCourses, newCourse]
      }));
      setNewCourse('');
    }
  };

  const handleRemoveCourse = (index) => {
    setFormData(prev => ({
      ...prev,
      linkedCourses: prev.linkedCourses.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    toast.success('Settings saved successfully!');
    onClose();
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Instructor (CI) Settings</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
      </div>

      <form className="settings-form">
        {/* Profile Picture */}
        <div className="form-section">
          <label className="section-label">Upload Profile Picture</label>
          <div className="image-upload">
            {profileImagePreview && (
              <div className="image-preview">
                <img src={profileImagePreview} alt="Profile" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
          </div>
        </div>

        {/* CI Profile Info */}
        <div className="form-section">
          <label htmlFor="profileInfo" className="section-label">CI Profile Information</label>
          <textarea
            id="profileInfo"
            name="profileInfo"
            value={formData.profileInfo}
            onChange={handleChange}
            placeholder="Enter your profile information..."
            rows="4"
            className="form-textarea"
          />
        </div>

        {/* Bio */}
        <div className="form-section">
          <label htmlFor="bio" className="section-label">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows="3"
            className="form-textarea"
          />
        </div>

        {/* Specialization */}
        <div className="form-section">
          <label htmlFor="specialization" className="section-label">Specialization</label>
          <input
            id="specialization"
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="Your area of specialization"
            className="form-input"
          />
        </div>

        {/* Office Hours */}
        <div className="form-section">
          <label htmlFor="officeHours" className="section-label">Office Hours</label>
          <input
            id="officeHours"
            type="text"
            name="officeHours"
            value={formData.officeHours}
            onChange={handleChange}
            placeholder="e.g., Mon & Wed 2-4 PM"
            className="form-input"
          />
        </div>

        {/* Link/Unlink Courses */}
        <div className="form-section">
          <label className="section-label">Link/Unlink Courses</label>
          <div className="course-input-group">
            <input
              type="text"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              placeholder="Add a course"
              className="form-input"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCourse())}
            />
            <button
              type="button"
              onClick={handleAddCourse}
              className="btn-add-course"
            >
              Link Course
            </button>
          </div>

          <div className="courses-list">
            {formData.linkedCourses.map((course, index) => (
              <div key={index} className="course-badge">
                <span>{course}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCourse(index)}
                  className="course-remove"
                  aria-label={`Remove ${course}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" onClick={handleSave} className="btn-save">
            Save Changes
          </button>
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
