import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../../components/Toast/Toast';
import './StudentSettings.css';

export default function StudentSettings({ user, onClose }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    portfolioInfo: user.portfolioInfo || '',
    profilePicture: user.profilePicture || '',
    skills: user.skills || [],
    projects: user.projects || [],
    bio: user.bio || ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState(user.profilePicture || '');

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

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
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
        <h2>Student Settings</h2>
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

        {/* Portfolio Info */}
        <div className="form-section">
          <label htmlFor="portfolioInfo" className="section-label">Portfolio Information</label>
          <textarea
            id="portfolioInfo"
            name="portfolioInfo"
            value={formData.portfolioInfo}
            onChange={handleChange}
            placeholder="Describe your portfolio and achievements..."
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

        {/* Skills */}
        <div className="form-section">
          <label className="section-label">Skills</label>
          <div className="skills-input-group">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a new skill"
              className="form-input"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn-add-skill"
            >
              Add Skill
            </button>
          </div>

          <div className="skills-list">
            {formData.skills.map((skill, index) => (
              <div key={index} className="skill-badge">
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="skill-remove"
                  aria-label={`Remove ${skill}`}
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
