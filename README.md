# MPCReport
Pixinsight scripts producing Minor Planet Center reports. 
From pictures .fits, .fit or .xisf with FITS Headers "DATE-OBS" a "EXPTIME", and from .csv files produced with DynamicPSF including view names, RA and DEC values, the MPCReport.js, produce a MPC Report compliante with MPC1992 format.
***
Version 0.1 - Initial version - A Prototype still needed a lot of improvement. 
work with Pixinsight 1.8.9-1
***
1/ plate solve your pictures, 
2/ record positions of the minor planet, on your different picture using DynamicPSF process
3/ save your records in csv files
4/ start MPCReport.js

- MPCReport.js and MPCBuilder.js have to be saved in the same directory
- prefix of you .csv file should be the packed number of the minor planet  
-

Limitations :
- need to load first any script from pixinsight...I don't know why
- only minor planet are managed (not comets or natural sattelites)
- only MPC1992 format is working (soon will come ADES PSV and XML format)
- magnitudes and bands need to be modified manualy in the report
- many values to setup and personnalize : 
  Set up the scripts in MPCBuilder.js :
- adapt values of Header data (line 40 to 52)
- update the report's save path :
-    filePath ( ligne 198)
