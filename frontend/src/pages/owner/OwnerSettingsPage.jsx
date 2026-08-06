import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  MapPin, 
  Lock, 
  Shield, 
  Activity, 
  Edit3, 
  Check, 
  Building2,
  Headphones,
  X,
  MessageSquare
} from 'lucide-react';
import './OwnerSettingsPage.css';

export default function OwnerSettingsPage() {
  const { theme } = useOutletContext() || { theme: 'light' };

  const [profile, setProfile] = useState({
    ownerName: "Karthik S",
    roleTitle: "Rural Mart Owner",
    enterpriseId: "RM-2024-8891",
    cooperative: "Sri Valli Rural Mart",
    email: "jaanu@gmail.com",
    mobileNumber: "+91 76859 43205",
    gstNumber: "33AAECG1234F1Z5",
    hubLocation: "Villupuram, Tamil Nadu",
    tradeStatus: "Active until Dec 2026"
  });

  const [twoFactor, setTwoFactor] = useState(true);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form States
  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [supportData, setSupportData] = useState({
    subject: "",
    message: ""
  });

  const handleOpenEditModal = () => {
    setFormData(profile);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(formData);
    setIsEditModalOpen(false);
    setSuccessMessage("Profile details updated successfully!");
    setIsSuccessPopupOpen(true);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setIsPasswordModalOpen(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSuccessMessage("Password updated successfully!");
    setIsSuccessPopupOpen(true);
  };

  const handleSubmitSupportTicket = (e) => {
    e.preventDefault();
    setIsSupportModalOpen(false);
    setSupportData({ subject: "", message: "" });
    setSuccessMessage("Support ticket submitted successfully! The KCT support team will contact you shortly.");
    setIsSuccessPopupOpen(true);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`settings-page-root ${isDark ? 'dark-theme' : ''}`}>
      {/* Top Header Section */}
      <div className="settings-top-header">
        <div>
          <h1 className={`settings-main-title ${isDark ? 'text-white' : ''}`}>Settings</h1>
          <p className={`settings-main-subtitle ${isDark ? 'text-gray-400' : ''}`}>Manage your profile, business entity credentials, and security settings</p>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="owner-hero-banner">
        <div className="owner-hero-left">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" 
            alt="Profile" 
            className="owner-hero-avatar"
          />
          <div>
            <div className="owner-hero-name-row">
              <h2 className="owner-hero-title">{profile.ownerName}</h2>
              <span className="owner-verified-badge"><Check size={12} /> Verified Owner</span>
            </div>
            <p className="owner-hero-subtitle">{profile.roleTitle} • Enterprise ID: {profile.enterpriseId}</p>
            <p className="owner-hero-coop">{profile.cooperative} ({profile.hubLocation})</p>
          </div>
        </div>
        <div className="owner-hero-actions">
          <button className="owner-hero-btn-light" onClick={handleOpenEditModal}>
            <Edit3 size={15} /> Edit Profile Details
          </button>
          <button className="owner-hero-btn-dark" onClick={() => setIsPasswordModalOpen(true)}>
            <Lock size={15} /> Change Password
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="settings-dashboard-grid">
        
        {/* PANEL 1: Business Entity */}
        <div className={`settings-panel ${isDark ? 'dark-panel' : ''}`}>
          <div className="settings-panel-header">
            <div className="settings-panel-icon-wrap">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className={`settings-panel-title ${isDark ? 'text-white' : ''}`}>BUSINESS ENTITY</h3>
            </div>
          </div>

          <div className="entity-field-group">
            <span className="entity-field-label">COMPANY NAME</span>
            <span className={`entity-field-value ${isDark ? 'text-gray-200' : ''}`}>{profile.cooperative}</span>
          </div>

          <div className="entity-field-group">
            <span className="entity-field-label">GST / TAX REGISTRATION</span>
            <span className={`entity-field-value mono-text ${isDark ? 'dark-mono' : ''}`}>{profile.gstNumber}</span>
          </div>

          <div className="entity-field-group">
            <span className="entity-field-label">REGISTERED OFFICIAL EMAIL</span>
            <span className={`entity-field-value ${isDark ? 'text-gray-200' : ''}`}>{profile.email}</span>
          </div>

          <div className="entity-field-group" style={{ marginBottom: 0 }}>
            <span className="entity-field-label">CONTACT PHONE</span>
            <span className={`entity-field-value ${isDark ? 'text-gray-200' : ''}`}>{profile.mobileNumber}</span>
          </div>
        </div>

        {/* PANEL 2: Trade License & Location */}
        <div className={`settings-panel ${isDark ? 'dark-panel' : ''}`}>
          <div className="settings-panel-header">
            <div className="settings-panel-icon-wrap">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className={`settings-panel-title ${isDark ? 'text-white' : ''}`}>TRADE LICENSE & LOCATION</h3>
            </div>
          </div>

          <div className="entity-field-group">
            <span className="entity-field-label">PRIMARY HUB LOCATION</span>
            <span className={`entity-field-value ${isDark ? 'text-gray-200' : ''}`}>{profile.hubLocation}</span>
          </div>

          <div className="entity-field-group" style={{ marginBottom: 0 }}>
            <span className="entity-field-label">TRADE LICENSE STATUS</span>
            <div>
              <span className="trade-status-pill">{profile.tradeStatus}</span>
            </div>
          </div>
        </div>

        {/* PANEL 3: Security & Auth */}
        <div className={`settings-panel ${isDark ? 'dark-panel' : ''}`}>
          <div className="settings-panel-header">
            <div className="settings-panel-icon-wrap">
              <Shield size={18} />
            </div>
            <div>
              <h3 className={`settings-panel-title ${isDark ? 'text-white' : ''}`}>SECURITY & AUTH</h3>
            </div>
          </div>

          <div className={`notification-toggle-card ${isDark ? 'dark-subcard' : ''}`} style={{ marginBottom: '14px' }}>
            <div className="notification-toggle-text">
              <span className={`notif-title-main ${isDark ? 'text-white' : ''}`}>Two-Factor Authentication</span>
              <span className="notif-desc-sub">Require SMS / App OTP</span>
            </div>
            <label className="custom-ios-switch">
              <input 
                type="checkbox" 
                checked={twoFactor} 
                onChange={() => setTwoFactor(!twoFactor)} 
              />
              <span className="ios-slider"></span>
            </label>
          </div>

          <div className={`trusted-sessions-box ${isDark ? 'dark-subcard' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Lock size={14} className="text-emerald-700" />
              <span className={`trusted-title ${isDark ? 'text-white' : ''}`}>Trusted Sessions</span>
            </div>
            <p className={`trusted-desc ${isDark ? 'text-gray-400' : ''}`}>3 Active Devices (Android POS Terminal, Chrome Web, Tablet)</p>
          </div>
        </div>

        {/* PANEL 4: Role Permissions */}
        <div className={`settings-panel ${isDark ? 'dark-panel' : ''}`}>
          <div className="settings-panel-header">
            <div className="settings-panel-icon-wrap">
              <Shield size={18} />
            </div>
            <div>
              <h3 className={`settings-panel-title ${isDark ? 'text-white' : ''}`}>ROLE PERMISSIONS</h3>
            </div>
          </div>

          <div className="permissions-chips-wrap">
            <span className="perm-chip">Super Admin</span>
            <span className="perm-chip">Financial Approver</span>
            <span className="perm-chip">Inventory Control</span>
            <span className="perm-chip">Supply Chain Lead</span>
          </div>

          <p className={`perm-description-text ${isDark ? 'text-gray-400' : ''}`}>
            Full administrative override across all 12 RuralMart outlets, inventory audits, and financial releases.
          </p>
        </div>

        {/* PANEL 5: Recent System Audit Log */}
        <div className={`settings-panel audit-log-panel ${isDark ? 'dark-panel' : ''}`}>
          <div className="settings-panel-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="settings-panel-icon-wrap">
                <Activity size={18} />
              </div>
              <h3 className={`settings-panel-title ${isDark ? 'text-white' : ''}`}>RECENT SYSTEM AUDIT LOG</h3>
            </div>
            <button className="audit-view-all-btn" onClick={() => alert("Opening full audit logs...")}>
              View Full Audit Log
            </button>
          </div>

          <div className={`audit-log-item ${isDark ? 'dark-subcard' : ''}`}>
            <div className="audit-dot green"></div>
            <div className="audit-content">
              <span className={`audit-item-title ${isDark ? 'text-white' : ''}`}>Saved Daily Business Entry (₹45,500)</span>
              <span className="audit-item-time">Today at 05:42 PM • Sri Valli Outlet #01</span>
            </div>
          </div>

          <div className={`audit-log-item ${isDark ? 'dark-subcard' : ''}`}>
            <div className="audit-dot dark"></div>
            <div className="audit-content">
              <span className={`audit-item-title ${isDark ? 'text-white' : ''}`}>Updated Inventory: Organic NPK Fertilizer (+220 units)</span>
              <span className="audit-item-time">Yesterday at 02:15 PM • Central Warehouse</span>
            </div>
          </div>

          <div className={`audit-log-item ${isDark ? 'dark-subcard' : ''}`} style={{ marginBottom: 0 }}>
            <div className="audit-dot amber"></div>
            <div className="audit-content">
              <span className={`audit-item-title ${isDark ? 'text-white' : ''}`}>Logbook Export: Outreach Training Session in Villupuram</span>
              <span className="audit-item-time">22 May 2024 at 11:30 AM • Field POS Device</span>
            </div>
          </div>
        </div>

        {/* PANEL 6: Help & Support */}
        <div className={`settings-panel support-panel ${isDark ? 'dark-panel' : ''}`}>
          <div className="settings-panel-header">
            <div className="settings-panel-icon-wrap">
              <Headphones size={18} />
            </div>
            <div>
              <h3 className={`settings-panel-title ${isDark ? 'text-white' : ''}`}>HELP & SUPPORT</h3>
              <p className={`settings-panel-subtitle-text ${isDark ? 'text-gray-400' : ''}`}>Get help and support from KCT team</p>
            </div>
          </div>

          <div className={`support-banner-box ${isDark ? 'dark-support-box' : ''}`}>
            <div className="support-banner-content">
              <h4 className={`support-box-heading ${isDark ? 'text-white' : ''}`}>Contact KCT Support</h4>
              <p className={`support-box-text ${isDark ? 'text-gray-300' : ''}`}>Our support team is here to help you with any issues or queries.</p>
              <button 
                onClick={() => setIsSupportModalOpen(true)}
                className="support-contact-btn"
              >
                <MessageSquare size={14} /> Contact Support
              </button>
            </div>
            <div className="support-avatar-illustration">
              <div className="support-cartoon-headset">
                <Headphones size={32} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* EDIT PROFILE MODAL POPUP */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className={`modal-card ${isDark ? 'dark-modal' : ''}`}>
            <div className="modal-header">
              <h3 className={`modal-title ${isDark ? 'text-white' : ''}`}>Edit Owner Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="modal-input-group">
                <label className="modal-label">Owner Name</label>
                <input 
                  type="text" 
                  value={formData.ownerName} 
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  className={`modal-input ${isDark ? 'dark-input' : ''}`}
                  required
                />
              </div>

              <div className="modal-input-group">
                <label className="modal-label">Company Name</label>
                <input 
                  type="text" 
                  value={formData.cooperative} 
                  onChange={(e) => setFormData({...formData, cooperative: e.target.value})}
                  className={`modal-input ${isDark ? 'dark-input' : ''}`}
                  required
                />
              </div>

              <div className="modal-input-group">
                <label className="modal-label">Registered Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`modal-input ${isDark ? 'dark-input' : ''}`}
                  required
                />
              </div>

              <div className="modal-input-group">
                <label className="modal-label">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.mobileNumber} 
                  onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                  className={`modal-input ${isDark ? 'dark-input' : ''}`}
                  required
                />
              </div>

              <div className="modal-footer-buttons">
                <button 
                  type="button" 
                  className={`modal-cancel-btn ${isDark ? 'dark-cancel' : ''}`}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL POPUP */}
      {isPasswordModalOpen && (
        <div className="modal-backdrop">
          <div className={`modal-card ${isDark ? 'dark-modal' : ''}`}>
            <div className="modal-header">
              <h3 className={`modal-title ${isDark ? 'text-white' : ''}`}>Change Password</h3>
              <button className="modal-close-btn" onClick={() => setIsPasswordModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="modal-form">
              <div className="modal-input-group">
                <label className="modal-label">Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword} 
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className={`modal-input ${isDark ? 'dark-input' : ''}`}
                  required
                />
              </div>

              <div className="modal-input-group">
                <label className="modal-label">New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className={`modal-input ${isDark ? 'dark-input' : ''}`}
                  required
                />
              </div>

              <div className="modal-input-group">
                <label className="modal-label">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className={`modal-input ${isDark ? 'dark-input' : ''}`}
                  required
                />
              </div>

              <div className="modal-footer-buttons">
                <button 
                  type="button" 
                  className={`modal-cancel-btn ${isDark ? 'dark-cancel' : ''}`}
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT SUPPORT TICKET MODAL POPUP */}
      {isSupportModalOpen && (
        <div className="modal-backdrop">
          <div className={`modal-card ${isDark ? 'dark-modal' : ''}`}>
            <div className="modal-header">
              <h3 className={`modal-title ${isDark ? 'text-white' : ''}`}>Contact KCT Support</h3>
              <button className="modal-close-btn" onClick={() => setIsSupportModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitSupportTicket} className="modal-form">
              <div className="modal-input-group">
                <label className="modal-label">Subject / Issue Category</label>
                <input 
                  type="text" 
                  placeholder="e.g., Inventory sync issue, Billing query"
                  value={supportData.subject} 
                  onChange={(e) => setSupportData({...supportData, subject: e.target.value})}
                  className={`modal-input ${isDark ? 'dark-input' : ''}`}
                  required
                />
              </div>

              <div className="modal-input-group">
                <label className="modal-label">Describe Your Query</label>
                <textarea 
                  rows="4"
                  placeholder="Type out your issue or query directly here..."
                  value={supportData.message} 
                  onChange={(e) => setSupportData({...supportData, message: e.target.value})}
                  className={`modal-input ${isDark ? 'dark-input' : ''}`}
                  style={{ resize: 'none' }}
                  required
                />
              </div>

              <div className="modal-footer-buttons">
                <button 
                  type="button" 
                  className={`modal-cancel-btn ${isDark ? 'dark-cancel' : ''}`}
                  onClick={() => setIsSupportModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP MODAL */}
      {isSuccessPopupOpen && (
        <div className="modal-backdrop">
          <div className={`modal-card success-popup-card ${isDark ? 'dark-modal' : ''}`} style={{ textAlign: 'center', maxWidth: '380px' }}>
            <div className="success-icon-wrap" style={{ 
              width: '54px', 
              height: '54px', 
              borderRadius: '50%', 
              backgroundColor: '#d1fae5', 
              color: '#065f46', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px auto' 
            }}>
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className={`modal-title ${isDark ? 'text-white' : ''}`} style={{ marginBottom: '8px' }}>Success</h3>
            <p style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
              {successMessage}
            </p>
            <button 
              onClick={() => setIsSuccessPopupOpen(false)}
              className="modal-save-btn"
              style={{ width: '100%' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}