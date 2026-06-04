// client/src/components/EmployeeModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { employeeSchema } from '../utils/validation';
import { CloseIcon } from './Icons';
import axios from 'axios';

const EmployeeModal = ({ isOpen, onClose, employee, onSave }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isEditMode = !!employee;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      employee_id: '',
      full_name: '',
      email: '',
      phone: '',
      gender: 'Male',
      dob: '',
      department: '',
      designation: '',
      salary: '',
      joining_date: '',
      status: 'Active',
      address: '',
    }
  });

  // Populate form if in edit mode
  useEffect(() => {
    if (isOpen) {
      setSubmitError('');
      setPreviewImage(null);
      setSelectedFile(null);
      if (employee) {
        // Format dates to YYYY-MM-DD for HTML inputs
        const formattedEmployee = {
          ...employee,
          dob: employee.dob ? employee.dob.split('T')[0] : '',
          joining_date: employee.joining_date ? employee.joining_date.split('T')[0] : '',
          salary: parseFloat(employee.salary) || ''
        };
        reset(formattedEmployee);
        if (employee.profile_image) {
          setPreviewImage(employee.profile_image);
        }
      } else {
        // Reset form for addition
        reset({
          employee_id: '',
          full_name: '',
          email: '',
          phone: '',
          gender: 'Male',
          dob: '',
          department: '',
          designation: '',
          salary: '',
          joining_date: new Date().toISOString().split('T')[0],
          status: 'Active',
          address: '',
        });
      }
    }
  }, [isOpen, employee, reset]);

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSubmitError('File is too large! Maximum limit is 2MB.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setSubmitError('');
    setSubmitting(true);

    // Build FormData payload
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    if (selectedFile) {
      formData.append('profile_image', selectedFile);
    }

    try {
      let response;
      if (isEditMode) {
        response = await axios.put(`/api/employees/${employee.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post('/api/employees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onSave(response.data);
      onClose();
    } catch (err) {
      console.error('Error submitting employee form:', err);
      const errMsg = err.response?.data?.message || 'Error occurred while saving employee record.';
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-primary-900 border-l border-gray-100 dark:border-white/5 shadow-2xl flex flex-col justify-between animate-slide-up sm:animate-none">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white font-display">
              {isEditMode ? 'Modify Employee Profile' : 'Register New Employee'}
            </h3>
            <p className="text-xs text-gray-400">Fill in the official employee credentials</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          {submitError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl">
              {submitError}
            </div>
          )}

          {/* Profile Picture Upload & Preview */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden flex items-center justify-center">
              {previewImage ? (
                <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image-input"
              />
              <label
                htmlFor="profile-image-input"
                className="inline-block px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold cursor-pointer border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition"
              >
                Choose Picture
              </label>
              <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP under 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Employee ID (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave blank for auto-gen"
                disabled={isEditMode}
                {...register('employee_id')}
                onInput={(e) => { e.target.value = e.target.value.toUpperCase(); }}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm disabled:opacity-50"
              />
              {errors.employee_id && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.employee_id.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                {...register('full_name')}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm ${
                  errors.full_name ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Email Address
              </label>
              <input
                type="email"
                placeholder="johndoe@company.com"
                {...register('email')}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm ${
                  errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 555 0199"
                {...register('phone')}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm ${
                  errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Gender
              </label>
              <select
                {...register('gender')}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-primary-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.gender.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Date of Birth
              </label>
              <input
                type="date"
                {...register('dob')}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm ${
                  errors.dob ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.dob && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.dob.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Department
              </label>
              <input
                type="text"
                placeholder="Engineering"
                {...register('department')}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm ${
                  errors.department ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.department && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.department.message}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Designation
              </label>
              <input
                type="text"
                placeholder="Senior Web Engineer"
                {...register('designation')}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm ${
                  errors.designation ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.designation && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.designation.message}</p>
              )}
            </div>

            {/* Salary */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Salary (Annual $)
              </label>
              <input
                type="number"
                placeholder="75000"
                {...register('salary')}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm ${
                  errors.salary ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.salary && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.salary.message}</p>
              )}
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Joining Date
              </label>
              <input
                type="date"
                {...register('joining_date')}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm ${
                  errors.joining_date ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.joining_date && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.joining_date.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-primary-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-sans">
              Residential Address
            </label>
            <textarea
              placeholder="123 Corporate Blvd, Apt 4"
              rows="3"
              {...register('address')}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all duration-200 text-sm"
            ></textarea>
            {errors.address && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.address.message}</p>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="px-5 py-2.5 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition flex items-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Profile...
              </>
            ) : (
              isEditMode ? 'Update Record' : 'Save Employee'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
