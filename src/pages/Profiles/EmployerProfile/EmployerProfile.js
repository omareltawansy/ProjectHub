import React from 'react';
import { safeUrl } from '../../../utils/safeUrl';
import './EmployerProfile.css';

export default function EmployerProfile({ user }) {
  return (
    <div className="profile-container employer-profile">
      <div className="profile-header">
        {user.profilePicture && (
          <div className="profile-picture">
            <img src={user.profilePicture} alt={user.companyName || user.name} />
          </div>
        )}
        <div className="profile-info">
          <h1>{user.companyName || user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-role">Employer</p>
        </div>
      </div>

      <div className="profile-content">
        {user.companyInfo && (
          <section className="profile-section">
            <h3>Company Information</h3>
            <p>{user.companyInfo}</p>
          </section>
        )}

        {user.industry && (
          <section className="profile-section">
            <h3>Industry</h3>
            <p>{user.industry}</p>
          </section>
        )}

        {user.website && (
          <section className="profile-section">
            <h3>Website</h3>
            <a href={safeUrl(user.website)} target="_blank" rel="noopener noreferrer">{user.website}</a>
          </section>
        )}

        {user.mapsLocation && (
          <section className="profile-section">
            <h3>Location</h3>
            <p>{user.mapsLocation}</p>
          </section>
        )}

        {user.taxCertificateDocs && user.taxCertificateDocs.length > 0 && (
          <section className="profile-section">
            <h3>Tax Certificates</h3>
            <ul className="docs-list">
              {user.taxCertificateDocs.map((doc, index) => (
                <li key={index}>{doc.name}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}