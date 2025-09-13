import React, { useState } from 'react';
import { TextField, Button, Box, Grid } from '@mui/material';


const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const[emailError, setEmailError]= useState(false);
  const[nameError, setNameError]= useState(false);
  const[phoneError, setPhoneError]= useState(false);
  const[clicked,setClicked]=useState(false);
 
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit mobile number
    return phoneRegex.test(phone);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setClicked(true);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    let isValid = true;

    // Validate Name
    if (!trimmedName) {
      setNameError(true);
      isValid = false;
    } else {
      setNameError(false);
    }
   // Validate Email
    if (!validateEmail(trimmedEmail)) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }

    // Validate Phone
    if (!validatePhone(trimmedPhone)) {
      setPhoneError(true);
      isValid = false;
    } else {
      setPhoneError(false);
    }

    // If all are valid
    if (isValid) {
      console.log('Submitting Form:');
      console.log('Name:', trimmedName);
      console.log('Email:', trimmedEmail);
      console.log('Phone:', trimmedPhone);
  

      // Reset fields
      setName('');
      setEmail('');
      setPhone('');
    } else {
      alert('Please fill all the required fields correctly.');
    }
  };


  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': {
          mb: 1.3,
          width: '100%',
        },
        '& .MuiButton-root': {
          mt: 2,
          width: '100%',
          maxWidth: '400px',
          display:'block',
          margin:'0 auto',
        },
            

        '& .MuiFormHelperText-root': {
          color: '#340606 !important',
         
        },
        
      }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >  
      <Grid container spacing={0.5}>
        <Grid item xs={12}>
      <TextField
        id="name"
        label="Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        error={nameError}
        helperText={nameError?'Please enter your name':''}
        InputProps={{
          sx:{
               
            backgroundColor:'rgba(255,227,169,0.7)',
            borderRadius:2,
              '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: '#340606', // Border color on error
      },
          },
        }}
            InputLabelProps={{
    sx: {
      color: nameError ? '#340606 !important' : '-moz-initial',
    },
  }}
      
      /> 
        </Grid>
        <Grid item xs={12}>
      <TextField
        id="email"
        label="Email"
        variant="outlined"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        error={emailError}
        helperText={emailError? 'enter a valid email address':''}
         InputProps={{
          sx:{
            backgroundColor:'rgba(255,227,169,0.7)',
            borderRadius:2,
             '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: '#340606',}
          },
        }}
         InputLabelProps={{
    sx: {
      color: emailError ? '#340606 !important' : '-moz-initial',
    },
  }}
      />
        </Grid>
          <Grid item xs={12}>
      <TextField
        id="phone"
        label="Phone Number"
        variant="outlined"
        type='tel'
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        error={phoneError}
        helperText={phoneError?'Please enter a valid phone number':''}
         InputProps={{
          sx:{
            backgroundColor:'rgba(255,227,169,0.7)',
            borderRadius:2,
             '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: '#340606',}
          },
        }}
             InputLabelProps={{
    sx: {
      color: phoneError ? '#340606 !important' : '-moz-initial',
    },
  }}
      />
          </Grid>
        <Grid item xs={12}>
      <Button variant="contained" color="primary" type="submit"
      sx={{
        color:'#340606',
        backgroundColor:'rgba(255,227,169,0.7)',
        borderRadius:'20px',
        width:'120px',
        '&:hover':{
          backgroundColor:clicked ?'rgba(255,227,169,0.3)':'rgba(255,227,169,0.3)',
        },
      }} >
        Submit
      </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactForm;
