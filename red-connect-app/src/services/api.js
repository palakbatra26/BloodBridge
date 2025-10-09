const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

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

  // Get all blood camps (public endpoint)
  async getBloodCamps(token) {
    try {
      // For public endpoint, we don't need to include auth token
      const response = await fetch(`${API_BASE_URL}/camps`, {
        headers: this.getHeadersWithToken(), // Don't pass token for public endpoint
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching blood camps:', error);
      throw error;
    }
  }

  // Register for a blood camp
  async registerForCamp(registrationData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/camps/register`, {
        method: 'POST',
        headers: this.getHeadersWithToken(token), // Include auth token
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error registering for camp:', error);
      throw error;
    }
  }

  // Get registrations for a specific camp
  async getCampRegistrations(campId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/camps/${campId}/registrations`, {
        headers: this.getHeadersWithToken(token),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching camp registrations:', error);
      throw error;
    }
  }
}

export default new ApiService();