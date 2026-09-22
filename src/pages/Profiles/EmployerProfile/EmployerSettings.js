import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../../components/Toast/Toast';
import { useAppData } from '../../../data/useAppData';
import './EmployerSettings.css';

export default function EmployerSettings({ user, onClose }) {
  const toast = useToast();
  const { employers, updateEmployers } = useAppData();
  const [formData, setFormData] = useState({
    companyInfo: user.companyInfo || '',
    companyName: user.companyName || '',
    mapsLocation: user.mapsLocation || '',
    taxCertificateDocs: user.taxCertificateDocs || [],
    industry: user.industry || '',
    phone: user.phone || '',
    website: user.website || '',
    contactEmail: user.contactEmail || user.email || ''
  });

  const [taxDocs, setTaxDocs] = useState(user.taxCertificateDocs || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaxDocChange = (e) => {
    const files = Array.from(e.target.files);
    const fileList = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setTaxDocs([...taxDocs, ...fileList]);
    setFormData(prev => ({
      ...prev,
      taxCertificateDocs: [...(prev.taxCertificateDocs || []), ...fileList]
    }));
  };

  const handleRemoveDoc = (index) => {
    const newDocs = taxDocs.filter((_, i) => i !== index);
    setTaxDocs(newDocs);
    setFormData(prev => ({
      ...prev,
      taxCertificateDocs: newDocs
    }));
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    // Also persist to global employers array so profile stays in sync
    const updatedEmployers = employers.map(e =>
      e.email === user.email ? { ...e, ...formData } : e
    );
    updateEmployers(updatedEmployers);
    toast.success('Profile saved successfully!');
    onClose();
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Employer Settings</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
      </div>

      <form className="settings-form">
        {/* Company Name */}
        <div className="form-section">
          <label htmlFor="companyName" className="section-label">Company Name</label>
          <input
            id="companyName"
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter your company name"
            className="form-input"
          />
        </div>

        {/* Company Info */}
        <div className="form-section">
          <label htmlFor="companyInfo" className="section-label">Employer Company Information</label>
          <textarea
            id="companyInfo"
            name="companyInfo"
            value={formData.companyInfo}
            onChange={handleChange}
            placeholder="Describe your company..."
            rows="4"
            className="form-textarea"
          />
        </div>

        {/* Industry */}
        <div className="form-section">
          <label htmlFor="industry" className="section-label">Industry</label>
          <input
            id="industry"
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="Your industry"
            className="form-input"
          />
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <label className="section-label">Contact Information</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone number (e.g. +20 100 123 4567)"
            className="form-input"
            style={{ marginBottom: 8 }}
          />
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="Public contact email"
            className="form-input"
            style={{ marginBottom: 8 }}
          />
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Website URL (https://example.com)"
            className="form-input"
          />
        </div>

        {/* Maps Location */}
        <div className="form-section">
          <label className="section-label">Employer Maps Location</label>
          <div className="maps-input-row">
            <input
              type="text"
              name="mapsLocation"
              value={formData.mapsLocation}
              onChange={handleChange}
              placeholder="Enter address or location name (e.g. Cairo, Egypt)"
              className="form-input maps-address-input"
            />
            {formData.mapsLocation && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(formData.mapsLocation)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="maps-open-btn"
              >
                Open in Maps ↗
              </a>
            )}
          </div>
          {formData.mapsLocation && (
            <div className="maps-preview">
              <iframe
                title="Location Preview"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.mapsLocation)}&output=embed`}
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: '8px', marginTop: '10px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        {/* Tax Certificate Documents */}
        <div className="form-section">
          <label className="section-label">Upload Tax Certificate Documents</label>
          <div className="file-upload">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleTaxDocChange}
              className="file-input"
            />
            <p className="file-help-text">Accept PDF, DOC, DOCX, and image files</p>
          </div>

          <div className="docs-list">
            {taxDocs.map((doc, index) => (
              <div key={index} className="doc-item">
                <div className="doc-info">
                  <span className="doc-name">{doc.name}</span>
                  <span className="doc-size">({(doc.size / 1024).toFixed(2)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(index)}
                  className="doc-remove"
                >
                  Remove
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
