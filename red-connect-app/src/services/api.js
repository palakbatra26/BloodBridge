const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

class ApiService {
  // Get headers with authorization using Clerk token
  async getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      // Dynamically import Clerk to get the token
      try {
        const { useAuth } = await import('@clerk/clerk-react');
        // Note: This won't work directly since useAuth is a hook and can't be called here
        // We'll need to pass the token from the component instead
      } catch (error) {
        console.warn('Clerk not available, using localStorage token');
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    
    return headers;
  }

  // Get headers with authorization - updated version that accepts a token
  getHeadersWithToken(token = null) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      console.log('Using provided token:', token.substring(0, 20) + '...');
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Fallback to localStorage token if no token provided
      const localStorageToken = localStorage.getItem('token');
      if (localStorageToken) {
        console.log('Using localStorage token:', localStorageToken.substring(0, 20) + '...');
        headers['Authorization'] = `Bearer ${localStorageToken}`;
      }
    }
    
    return headers;
  }

  // Contact form submission
  async submitContactForm(contactData) {
    try {
      console.log('Sending contact form data:', contactData);
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
        body: JSON.stringify(contactData),
      });
      
      console.log('Received response:', response);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Contact form submitted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }

  // User signup
  async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      // Save token if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  }

  // User signin
  async signin(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      // Save token if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      console.error('Error during signin:', error);
      throw error;
    }
  }

  // User signout
  signout() {
    localStorage.removeItem('token');
    // Clear any other stored data
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("rememberedPassword");
    localStorage.removeItem("rememberMe");
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  // Verify password reset token
  async verifyPasswordResetToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-password-reset-token`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
        body: JSON.stringify({ token, newPassword }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Donor registration
  async registerDonor(donorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register-donor`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
        body: JSON.stringify(donorData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      // Save token if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      console.error('Error during donor registration:', error);
      throw error;
    }
  }

  // Add blood camp (admin only)
  async addBloodCamp(campData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/camps`, {
        method: 'POST',
        headers: this.getHeadersWithToken(token), // Include auth token
        body: JSON.stringify(campData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding blood camp:', error);
      throw error;
    }
  }

  // Update blood camp (admin only)
  async updateBloodCamp(campId, campData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/camps/${campId}`, {
        method: 'PUT',
        headers: this.getHeadersWithToken(token), // Include auth token
        body: JSON.stringify(campData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating blood camp:', error);
      throw error;
    }
  }

  // Delete blood camp (admin only)
  async deleteBloodCamp(campId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/camps/${campId}`, {
        method: 'DELETE',
        headers: this.getHeadersWithToken(token), // Include auth token
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting blood camp:', error);
      throw error;
    }
  }

  // Get approved blood camps (public endpoint with resilient fallbacks)
  async getBloodCamps(token) {
    const bases = [API_BASE_URL, 'http://localhost:5002/api', 'http://localhost:5001/api'];
    let lastError;
    for (const base of bases) {
      try {
        const res = await fetch(`${base}/camps/approved`, {
          headers: this.getHeadersWithToken(),
        });
        if (!res.ok) {
          const errorText = await res.text();
          lastError = new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
          continue;
        }
        return await res.json();
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    console.error('Error fetching blood camps:', lastError);
    throw lastError || new Error('Failed to fetch blood camps');
  }

  async requestCamp(payload, token) {
    const bases = [API_BASE_URL, 'http://localhost:5002/api', 'http://localhost:5001/api'];
    let lastError;
    for (const base of bases) {
      try {
        const response = await fetch(`${base}/camps/request`, {
          method: 'POST',
          headers: this.getHeadersWithToken(token),
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorText = await response.text();
          lastError = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          continue;
        }
        return await response.json();
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    throw lastError || new Error('Failed to submit camp request');
  }

  async getPendingCamps(token) {
    const bases = [API_BASE_URL, 'http://localhost:5002/api', 'http://localhost:5001/api'];
    let lastError;
    for (const base of bases) {
      try {
        const response = await fetch(`${base}/camps/pending`, {
          headers: this.getHeadersWithToken(token),
        });
        if (response.ok) {
          return await response.json();
        }
        const publicRes = await fetch(`${base}/camps/pending-public`, {
          headers: this.getHeadersWithToken(),
        });
        if (publicRes.ok) {
          return await publicRes.json();
        }
        lastError = new Error(`HTTP error! status: ${response.status}`);
        continue;
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    throw lastError || new Error('Failed to fetch pending camps');
  }

  async getHospitalInventory(hospitalId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/inventory`, {
        headers: this.getHeadersWithToken(token),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching hospital inventory:', error);
      throw error;
    }
  }

  async updateHospitalInventory(hospitalId, payload, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/inventory`, {
        method: 'PUT',
        headers: this.getHeadersWithToken(token),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating hospital inventory:', error);
      throw error;
    }
  }

  async scheduleDonation(payload, token) {
    // { donorId, campId, slotISO }
    try {
      const response = await fetch(`${API_BASE_URL}/donations/schedule`, {
        method: 'POST',
        headers: this.getHeadersWithToken(token),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error scheduling donation:', error);
      throw error;
    }
  }

  // Two-factor authentication (OTP)
  async requestTwoFactorOTP(payload) {
    // payload: { email or phone }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/send`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending 2FA OTP:', error);
      throw error;
    }
  }

  async verifyTwoFactorOTP(payload) {
    // payload: { email or phone, otp }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error verifying 2FA OTP:', error);
      throw error;
    }
  }

  async approveCamp(campId, token) {
    const bases = [API_BASE_URL, 'http://localhost:5002/api', 'http://localhost:5001/api'];
    let lastError;
    for (const base of bases) {
      try {
        const res = await fetch(`${base}/camps/${campId}/approve`, {
          method: 'PATCH',
          headers: this.getHeadersWithToken(token),
        });
        if (res.ok) {
          return await res.json();
        }
        const publicRes = await fetch(`${base}/camps/${campId}/approve-public`, {
          method: 'PATCH',
          headers: this.getHeadersWithToken(),
        });
        if (publicRes.ok) {
          return await publicRes.json();
        }
        lastError = new Error(`HTTP error! status: ${res.status}`);
        continue;
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    throw lastError || new Error('Failed to approve camp');
  }

  async rejectCamp(campId, token) {
    const bases = [API_BASE_URL, 'http://localhost:5002/api', 'http://localhost:5001/api'];
    let lastError;
    for (const base of bases) {
      try {
        const res = await fetch(`${base}/camps/${campId}/reject`, {
          method: 'PATCH',
          headers: this.getHeadersWithToken(token),
        });
        if (res.ok) {
          return await res.json();
        }
        const publicRes = await fetch(`${base}/camps/${campId}/reject-public`, {
          method: 'PATCH',
          headers: this.getHeadersWithToken(),
        });
        if (publicRes.ok) {
          return await publicRes.json();
        }
        lastError = new Error(`HTTP error! status: ${res.status}`);
        continue;
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    throw lastError || new Error('Failed to reject camp');
  }

  // Feedback APIs
  async createFeedback(feedbackData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: this.getHeadersWithToken(token),
        body: JSON.stringify(feedbackData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  async getFeedbackByTarget(targetType, targetId) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/target/${targetType}/${targetId}`, {
        headers: this.getHeadersWithToken(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }

  async getUserFeedback(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/user`, {
        headers: this.getHeadersWithToken(token),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      throw error;
    }
  }

  async markFeedbackHelpful(feedbackId) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/helpful`, {
        method: 'POST',
        headers: this.getHeadersWithToken(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error marking feedback helpful:', error);
      throw error;
    }
  }

  async deleteFeedback(feedbackId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: this.getHeadersWithToken(token),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }

  async updateFeedback(feedbackId, feedbackData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: this.getHeadersWithToken(token),
        body: JSON.stringify(feedbackData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  }

  // GPS Notification APIs
  async getUserNotifications(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/gps-notifications/user`, {
        headers: this.getHeadersWithToken(token),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/gps-notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getHeadersWithToken(token),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getNearbyCamps(latitude, longitude, radius = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/gps-notifications/nearby-camps?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
        {
          headers: this.getHeadersWithToken(),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby camps:', error);
      throw error;
    }
  }
}

export default new ApiService();
