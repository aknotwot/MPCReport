# MPCReport
Pixinsight scripts producing Minor Planet Center reports. 
From pictures .fits, .fit or .xisf with FITS Headers "DATE-OBS" a "EXPTIME", and from .csv files produced with DynamicPSF including view names, RA and DEC values, the MPCReport.js, produce a MPC Report compliant with MPC1992 format.
***
Pre-Release v0.1.1b - Initial version - A Prototype still needed a lot of improvements. 
Functionnal with Pixinsight 1.8.9-1
***
1/ plate solve your pictures, 
2/ record positions of the minor planet, on your different picture using DynamicPSF process
3/ save your records in csv files
4/ start MPCReport.js


- MPCReport.js and MPCBuilder.js have to be saved in the same directory
- Advise : prefix of you .csv file with the packed number of the minor planet, anyway packed number will be the five first caracters of the csv file name.  

Limitations :
- cf. release comments
