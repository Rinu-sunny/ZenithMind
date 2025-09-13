import React from 'react';
import { Container, Typography,Paper, } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ContactForm from './contactpg.jsx';

   const theme=createTheme({
     typography:{
       fontFamily:['arial']
     },
     palette:{
    primary:{
     main:'#1976d2', 
     },
    },
   });
function App(){
  return (
    <ThemeProvider theme={theme}>
    <Container  maxWidth="sm" >
      <Paper elevation={5
      } sx={{ borderRadius:3,                    
         marginTop:'80px',                     
         display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', 
          padding: '40px',
          backgroundColor:'rgba(255,227,169,0.4)',
          height:'450px',
          }}>
      <Typography variant="h4" align="center" gutterBottom sx={{color:'#FFE3A9',fontFamily:'gabriela,serif',
        fontSize:'64px',
        fontWeight:'bold',
         textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        letterSpacing:'2px',
        mt:6,
        mb:'auto'}}>
        Login
      </Typography>
      <ContactForm />
      </Paper>
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#340606', 
        zIndex: -1, 
        }} />
    </Container>
    </ThemeProvider>
  );
}

export default App;

