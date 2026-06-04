// client/src/utils/validation.js
import * as yup from 'yup';

export const employeeSchema = yup.object().shape({
  employee_id: yup
    .string()
    .nullable()
    .notRequired()
    .test('id-format', 'Employee ID must be alphanumeric', val => !val || /^[a-zA-Z0-9\-]+$/.test(val)),
  full_name: yup
    .string()
    .required('Full Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be under 50 characters'),
  email: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9+\-\s()]{7,15}$/, 'Please enter a valid phone number (7-15 digits)'),
  gender: yup
    .string()
    .oneOf(['Male', 'Female', 'Other'], 'Please select a valid gender option')
    .required('Gender is required'),
  dob: yup
    .date()
    .typeError('Invalid date format')
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth must be in the past')
    .test('age', 'Employee must be at least 18 years old', val => {
      if (!val) return false;
      const today = new Date();
      const birthDate = new Date(val);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }),
  department: yup.string().required('Department is required').min(2, 'Department is too short'),
  designation: yup.string().required('Designation is required').min(2, 'Designation is too short'),
  salary: yup
    .number()
    .typeError('Salary must be a valid number')
    .required('Salary is required')
    .positive('Salary must be a positive number')
    .min(1000, 'Salary must be at least $1,000'),
  joining_date: yup
    .date()
    .typeError('Invalid date format')
    .required('Joining date is required'),
  status: yup
    .string()
    .oneOf(['Active', 'Inactive'], 'Please select a valid status')
    .required('Status is required'),
  address: yup.string().nullable().notRequired(),
});
