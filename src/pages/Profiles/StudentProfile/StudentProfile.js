import React from 'react';
import './StudentProfile.css';

export default function StudentProfile({ user }) {
  return (
    <div className="profile-container student-profile">
      <div className="profile-header">
        {user.profilePicture && (
          <div className="profile-picture">
            <img src={user.profilePicture} alt={user.name} />
          </div>
        )}
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-role">Student</p>
        </div>
      </div>

      <div className="profile-content">
        {user.bio && (
          <section className="profile-section">
            <h3>About</h3>
            <p>{user.bio}</p>
          </section>
        )}

        {user.portfolioInfo && (
          <section className="profile-section">
            <h3>Portfolio Information</h3>
            <p>{user.portfolioInfo}</p>
          </section>
        )}

        {user.skills && user.skills.length > 0 && (
          <section className="profile-section">
            <h3>Skills</h3>
            <div className="skills-display">
              {user.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </section>
        )}

        {user.projects && user.projects.length > 0 && (
          <section className="profile-section">
            <h3>Projects</h3>
            <ul>
              {user.projects.map((project, index) => (
                <li key={index}>{project}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}