import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function DriverRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    password: '',
    phone: '',
    aadhaar: '',
    pan: '',
    
    // License Information
    licenseNumber: '',
    licenseUpload: null,
    
    // Vehicle Information
    vehicleType: '',
    vehicleNumber: '',
    rcUpload: null,
    insuranceUpload: null,
    
    // Bank Information
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    cancelledChequeUpload: null,
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Address
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Optional
    inviteCode: '',
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First, register the user
      const user = await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'driver',
        phone: formData.phone,
      });
      
      // Then submit the driver application with documents
      const applicationData = new FormData();
      
      // Personal Information
      applicationData.append('fullName', formData.fullName);
      applicationData.append('email', formData.email);
      applicationData.append('phone', formData.phone);
      applicationData.append('aadhaar', formData.aadhaar);
      applicationData.append('pan', formData.pan);
      
      // License Information
      applicationData.append('licenseNumber', formData.licenseNumber);
      if (formData.licenseUpload) {
        applicationData.append('licenseUpload', formData.licenseUpload);
      }
      
      // Vehicle Information
      applicationData.append('vehicleType', formData.vehicleType);
      applicationData.append('vehicleNumber', formData.vehicleNumber);
      if (formData.rcUpload) {
        applicationData.append('rcUpload', formData.rcUpload);
      }
      if (formData.insuranceUpload) {
        applicationData.append('insuranceUpload', formData.insuranceUpload);
      }
      
      // Bank Information
      applicationData.append('bankName', formData.bankName);
      applicationData.append('accountHolder', formData.accountHolder);
      applicationData.append('accountNumber', formData.accountNumber);
      applicationData.append('ifsc', formData.ifsc);
      if (formData.cancelledChequeUpload) {
        applicationData.append('cancelledChequeUpload', formData.cancelledChequeUpload);
      }
      
      // Emergency Contact
      applicationData.append('emergencyContactName', formData.emergencyContactName);
      applicationData.append('emergencyContactPhone', formData.emergencyContactPhone);
      applicationData.append('emergencyContactRelation', formData.emergencyContactRelation);
      
      // Address
      applicationData.append('address', formData.address);
      applicationData.append('city', formData.city);
      applicationData.append('state', formData.state);
      applicationData.append('pincode', formData.pincode);
      
      // Optional
      if (formData.inviteCode) {
        applicationData.append('inviteCode', formData.inviteCode);
      }
      
      // Submit application
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/driver/${user._id}/application`, {
        method: 'POST',
        body: applicationData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Application submission failed');
      }
      
      toast.success('Driver application submitted successfully! Please wait for admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validation for current step
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
        toast.error('Please fill all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-lumina-950 to-slate-900 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-2xl font-bold text-lumina-600">Lumina Logistics</Link>
        <h1 className="text-3xl font-bold mt-6 mb-2 text-white">Driver Registration</h1>
        <p className="text-slate-400 mb-8">Complete your driver application. All fields are required.</p>
        
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 ${s < 4 ? 'mr-2' : ''}`}>
              <div className={`h-2 rounded-full ${step >= s ? 'bg-lumina-600' : 'bg-slate-700'}`} />
              <p className={`text-xs mt-1 ${step >= s ? 'text-lumina-600' : 'text-slate-500'}`}>
                {s === 1 ? 'Personal' : s === 2 ? 'License' : s === 3 ? 'Vehicle' : 'Bank & Address'}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card dark:bg-slate-800/90">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
              <input className="input-field" type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
              <input className="input-field" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <input className="input-field" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
              <input className="input-field" type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
              <input className="input-field" type="text" name="aadhaar" placeholder="Aadhaar Number" value={formData.aadhaar} onChange={handleChange} required />
              <input className="input-field" type="text" name="pan" placeholder="PAN Number" value={formData.pan} onChange={handleChange} required />
              <input className="input-field" type="text" name="inviteCode" placeholder="Invite Code (Optional)" value={formData.inviteCode} onChange={handleChange} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">License Information</h2>
              <input className="input-field" type="text" name="licenseNumber" placeholder="Driving License Number" value={formData.licenseNumber} onChange={handleChange} required />
              <div>
                <label className="block text-sm text-slate-400 mb-2">Upload License</label>
                <input type="file" name="licenseUpload" onChange={handleChange} accept="image/*,.pdf" className="input-field" required />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Vehicle Information</h2>
              <select className="input-field" name="vehicleType" value={formData.vehicleType} onChange={handleChange} required>
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
              </select>
              <input className="input-field" type="text" name="vehicleNumber" placeholder="Vehicle Number" value={formData.vehicleNumber} onChange={handleChange} required />
              <div>
                <label className="block text-sm text-slate-400 mb-2">Upload RC Book</label>
                <input type="file" name="rcUpload" onChange={handleChange} accept="image/*,.pdf" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Upload Insurance</label>
                <input type="file" name="insuranceUpload" onChange={handleChange} accept="image/*,.pdf" className="input-field" required />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Bank & Address Information</h2>
              <input className="input-field" type="text" name="bankName" placeholder="Bank Name" value={formData.bankName} onChange={handleChange} required />
              <input className="input-field" type="text" name="accountHolder" placeholder="Account Holder Name" value={formData.accountHolder} onChange={handleChange} required />
              <input className="input-field" type="text" name="accountNumber" placeholder="Account Number" value={formData.accountNumber} onChange={handleChange} required />
              <input className="input-field" type="text" name="ifsc" placeholder="IFSC Code" value={formData.ifsc} onChange={handleChange} required />
              <div>
                <label className="block text-sm text-slate-400 mb-2">Upload Cancelled Cheque</label>
                <input type="file" name="cancelledChequeUpload" onChange={handleChange} accept="image/*,.pdf" className="input-field" required />
              </div>
              
              <h3 className="text-lg font-bold text-white mt-6 mb-2">Emergency Contact</h3>
              <input className="input-field" type="text" name="emergencyContactName" placeholder="Emergency Contact Name" value={formData.emergencyContactName} onChange={handleChange} required />
              <input className="input-field" type="tel" name="emergencyContactPhone" placeholder="Emergency Contact Phone" value={formData.emergencyContactPhone} onChange={handleChange} required />
              <input className="input-field" type="text" name="emergencyContactRelation" placeholder="Relation" value={formData.emergencyContactRelation} onChange={handleChange} required />
              
              <h3 className="text-lg font-bold text-white mt-6 mb-2">Address</h3>
              <textarea className="input-field" name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} required rows="3" />
              <input className="input-field" type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
              <input className="input-field" type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
              <input className="input-field" type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn-secondary flex-1">
                Previous
              </button>
            )}
            {step < 4 ? (
              <button type="button" onClick={nextStep} className="btn-primary flex-1">
                Next
              </button>
            ) : (
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>

        <p className="text-center mt-6 text-slate-400">
          Already have an account? <Link to="/login" className="text-lumina-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
