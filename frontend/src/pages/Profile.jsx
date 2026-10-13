import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/Profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState("");
    const [saving, setSaving] = useState(false);

    const getProfile = async () => {
        try {
            setError("");

            const response = await API.get("profile/");
            setProfile(response.data);
            setEmail(response.data.email || "");
        } catch (error) {
            console.log(error.response?.data);
            setError("Unable to load profile.");
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await API.patch("profile/", {
                email: email.trim(),
            });

            setProfile(response.data);
            setEmail(response.data.email);
            setIsEditing(false);
            setSuccess("Profile updated successfully.");
        } catch (error) {
            const data = error.response?.data;

            setError(
                data?.email?.[0] ||
                data?.message ||
                "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEmail(profile?.email || "");
        setIsEditing(false);
        setError("");
        setSuccess("");
    };

    return (
        <main className="profile-page">
            <section className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profile?.username?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div>
                        <span className="profile-label">My Account</span>
                        <h1>My Profile</h1>
                        <p>View and update your Learnova account information.</p>
                    </div>
                </div>

                {error && (
                    <div className="profile-error" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="profile-success" role="status">
                        {success}
                    </div>
                )}

                {profile && (
                    <div className="profile-details">
                        <div className="profile-detail">
                            <span>Username</span>
                            <strong>{profile.username}</strong>
                        </div>

                        <div className="profile-detail">
                            <span>Email</span>

                            {isEditing ? (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    maxLength={254}
                                    aria-label="Email address"
                                />
                            ) : (
                                <strong>{profile.email || "Not provided"}</strong>
                            )}
                        </div>

                        <div className="profile-detail">
                            <span>Account Type</span>
                            <strong className="profile-badge">
                                {profile.user_type}
                            </strong>
                        </div>

                        <div className="profile-actions">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        className="profile-save-button"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>

                                    <button
                                        type="button"
                                        className="profile-cancel-button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className="profile-edit-button"
                                    onClick={() => {
                                        setEmail(profile.email || "");
                                        setError("");
                                        setSuccess("");
                                        setIsEditing(true);
                                    }}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

export default Profile;