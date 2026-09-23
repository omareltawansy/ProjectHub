import React, { useState } from 'react';
import { X, Bell, BellOff } from 'lucide-react';
import { useToast } from '../../../components/Toast/Toast';
import { useAppData } from '../../../data/useAppData';
import { resizeImageFile } from '../../../utils/image';
import './AdminSettings.css';

export default function AdminSettings({ user, onClose }) {
  const toast = useToast();
  const { updateUser } = useAppData();
  const [formData, setFormData] = useState({
    profilePicture: user.profilePicture || '',
    bio: user.bio || '',
    department: user.department || '',
    phone: user.phone || '',
    officeLocation: user.officeLocation || '',
    adminNotes: user.adminNotes || '',
  });

  // Req 91 — notification preference (persisted in localStorage)
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem('adminNotificationsEnabled');
    return stored === null ? true : stored === 'true';
  });

  const [profileImagePreview, setProfileImagePreview] = useState(user.profilePicture || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file);
      setProfileImagePreview(dataUrl);
      setFormData(prev => ({ ...prev, profilePicture: dataUrl }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    updateUser(user.id, formData);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    localStorage.setItem('adminNotificationsEnabled', String(notificationsEnabled));
    toast.success('Settings saved successfully!');
    onClose();
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Administrator Settings</h2>
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

        {/* Department */}
        <div className="form-section">
          <label htmlFor="department" className="section-label">Department</label>
          <input
            id="department"
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Your department"
            className="form-input"
          />
        </div>

        {/* Phone */}
        <div className="form-section">
          <label htmlFor="phone" className="section-label">Phone</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your phone number"
            className="form-input"
          />
        </div>

        {/* Office Location */}
        <div className="form-section">
          <label htmlFor="officeLocation" className="section-label">Office Location</label>
          <input
            id="officeLocation"
            type="text"
            name="officeLocation"
            value={formData.officeLocation}
            onChange={handleChange}
            placeholder="Your office location"
            className="form-input"
          />
        </div>

        {/* Admin Notes */}
        <div className="form-section">
          <label htmlFor="adminNotes" className="section-label">Admin Notes</label>
          <textarea
            id="adminNotes"
            name="adminNotes"
            value={formData.adminNotes}
            onChange={handleChange}
            placeholder="Internal admin notes..."
            rows="4"
            className="form-textarea"
          />
        </div>

        {/* Preferences */}
        <div className="form-section">
          <label className="section-label">Preferences</label>
          <div className="as-pref-list">
            <div className="as-toggle-row">
              <div className="as-toggle-label">
                <span className="as-toggle-title">
                  {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                  Notifications
                </span>
                <span className="as-toggle-desc">
                  {notificationsEnabled
                    ? 'You are receiving all platform notifications.'
                    : 'All notifications are currently muted.'}
                </span>
              </div>
              <label className="as-toggle-switch" aria-label="Toggle notifications">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
                <span className="as-toggle-slider" />
              </label>
            </div>
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
