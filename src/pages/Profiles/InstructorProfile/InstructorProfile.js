import React from 'react';
import './InstructorProfile.css';

export default function InstructorProfile({ user }) {
  return (
    <div className="profile-container instructor-profile">
      <div className="profile-header">
        {user.profilePicture && (
          <div className="profile-picture">
            <img src={user.profilePicture} alt={user.name} />
          </div>
        )}
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-role">Instructor (CI)</p>
        </div>
      </div>

      <div className="profile-content">
        {user.profileInfo && (
          <section className="profile-section">
            <h3>CI Profile Information</h3>
            <p>{user.profileInfo}</p>
          </section>
        )}

        {user.bio && (
          <section className="profile-section">
            <h3>Bio</h3>
            <p>{user.bio}</p>
          </section>
        )}

        {user.specialization && (
          <section className="profile-section">
            <h3>Specialization</h3>
            <p>{user.specialization}</p>
          </section>
        )}

        {user.officeHours && (
          <section className="profile-section">
            <h3>Office Hours</h3>
            <p>{user.officeHours}</p>
          </section>
        )}

        {user.linkedCourses && user.linkedCourses.length > 0 && (
          <section className="profile-section">
            <h3>Linked Courses</h3>
            <div className="courses-display">
              {user.linkedCourses.map((course, index) => (
                <div key={index} className="course-card">{course}</div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}