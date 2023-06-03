/*  MPCReport - Producing observation reports for MPC  - UI
 *  Copyright (C) 2023, Arnaud Dupont
 *
 *
 * Using part of source code from Image Plate Solver script, mostly for UI
 *  *
 * Copyright (C) 2012-2022, Andres del Pozo
 * Contributions (C) 2019-2022, Juan Conejero (PTeam)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

#feature-info  A script to build Minor Planet Observations Report<br/>\
               <br/>\Copyright &copy; 2012-2022 Andr&eacute;s del Pozo<br/>\
               <br/>\Copyright &copy; 2023 Arnaud Dupont<br/>\
               Contributions &copy; 2019-2022 Juan Conejero (PTeam)



#include <pjsr/DataType.jsh>
#include <pjsr/Sizer.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/TextAlign.jsh>
#include <pjsr/StdButton.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdCursor.jsh>
#include <pjsr/UndoFlag.jsh>
#include <pjsr/ColorSpace.jsh>
#include <pjsr/NumericControl.jsh>

#ifndef __PJSR_SectionBar_jsh
#include <pjsr/SectionBar.jsh>
#endif
#define TITLE "MPC Report Builder"
#define SETTINGS_MODULE "REPORT"


#include "MPCBuilder.js"


#define STAR_CSV_FILE   File.systemTempDirectory + "/stars.csv"

//#endif // !USE_SOLVER_LIBRARY

#define SETTINGS_MODULE_SCRIPT "REPORT"
#define MPCREPORTVERSION "0.1"
var isFormatSelectedMain = false ;
// debugMode to be activated from MPCBuilder.js

function MPCReportConfiguration( module )
{
   this.__base__ = ObjectWithSettings;
   this.__base__(
      module,
      "solver",
      new Array(
         [ "version", DataType_UCString ],
         [ "useActive", DataType_Boolean ]
        )
   );

   this.version = MPCREPORTVERSION;
   this.useActive = true;
   this.ResetSettings = function()
   {
      Settings.remove( SETTINGS_MODULE );
   };
}

MPCReportConfiguration.prototype = new ObjectWithSettings;

// ----------------------------------------------------------------------------

/*
 * MPCReportDialog: Configuration dialog for the mpc report bluider.
 */
function MPCReportDialog( solverCfg, metadata, builder, showTargetImage, showCSVData )
{
   this.__base__ = Dialog;
   this.__base__();

   let labelWidth1 = this.font.width( "Minimum structure size:" + "M" );// TODO
   let radioLabelWidth = this.font.width( "Focal distance:" + "M" ); //TODO
   let spinBoxWidth = 7 * this.font.width( 'M' );//TODO

   this.solverCfg = solverCfg;
   this.metadata = metadata;

   this.helpLabel = new Label( this );
   this.helpLabel.frameStyle = FrameStyle_Box;
   this.helpLabel.minWidth = 45 * this.font.width( 'M' ); //TODO
   this.helpLabel.margin = 6;
   this.helpLabel.wordWrapping = true;
   this.helpLabel.useRichText = true;
   this.helpLabel.text = "<p><b>MPCReportBuilder v" + MPCREPORTVERSION + "</b> &mdash; " +
      "A script building Minor Planet Center Report.<br/>" +
      "<br/>\Copyright &copy; 2012-2022 Andr&eacute;s del Pozo<br/>" +\
      "<br/>\Copyright &copy; 2023 Arnaud Dupont<br/>" +
      "Contributions &copy; 2019-2022 Juan Conejero (PTeam)";

   function toggleSectionHandler( section, toggleBegin )
   {
      if ( !toggleBegin )
      {
         section.dialog.setVariableHeight();
         section.dialog.adjustToContents();
         if ( section.dialog.targetImage_Section && section.dialog.targetImage_Section.isCollapsed() ||
            section.dialog.solverCfg.useActive )
            section.dialog.setFixedHeight();
         else
            section.dialog.setMinHeight();
      }
   }
  // -------------------------------------------------------------------------
   // REPORT FORMAT SELECTION
   // -------------------------------------------------------------------------

   this.mpc1992Format_CheckBox = new CheckBox( this );
   this.mpc1992Format_CheckBox.text = "MPC1992";
   this.mpc1992Format_CheckBox.checked = false;
   this.mpc1992Format_CheckBox.toolTip = "<p>Text file produced in compliance legacy - MPC1992 - MPC Reports.</p>";
   this.mpc1992Format_CheckBox.onCheck = function( checked )
   {
     isFormatSelectedMain = builder.setFormatReport (0);
	 logDebug("Report format selected ? " + isFormatSelectedMain);
    };
   this.adesPsvFormat_CheckBox = new CheckBox( this );
   this.adesPsvFormat_CheckBox.text = "ADES PSV";
   this.adesPsvFormat_CheckBox.checked = false; 
   this.adesPsvFormat_CheckBox.toolTip = "<p>Text file produce in compliance legacy MPC Reports.</p>";
   this.adesPsvFormat_CheckBox.enable = false; // ADES PSV FORMAT REPORTS NOT available yet 
   this.adesPsvFormat_CheckBox.onCheck = function( checked )
   {
     isFormatSelectedMain = builder.setFormatReport (1);
	 logDebug("Report format selected ? " + isFormatSelectedMain);
   };
   this.adesXmlFormat_CheckBox = new CheckBox( this );
   this.adesXmlFormat_CheckBox.text = "ADES XML";
   this.adesXmlFormat_CheckBox.checked = false; 
   this.adesXmlFormat_CheckBox.toolTip = "<p>Text file produce in compliance legacy MPC Reports.</p>";
   this.adesPsvFormat_CheckBox.enable = false; // ADES XML FORMAT REPORTS NOT available yet 
   this.adesXmlFormat_CheckBox.onCheck = function( checked )
   {
     isFormatSelectedMain = builder.setFormatReport (2);
	 logDebug("Report format selected ? " + isFormatSelectedMain);
    };

   // TODO - CENTRER LES cases à cocher
   this.reportFormat_Sizer = new HorizontalSizer;
   this.reportFormat_Sizer.add( this.mpc1992Format_CheckBox );
   this.reportFormat_Sizer.add( this.adesPsvFormat_CheckBox );
   this.reportFormat_Sizer.add( this.adesXmlFormat_CheckBox );


   this.format_GroupBox = new GroupBox( this );
   this.format_GroupBox.title = "Report Format";
   this.format_GroupBox.sizer = new HorizontalSizer;
   this.format_GroupBox.sizer.margin = 4;
   this.format_GroupBox.sizer.spacing = 4;
   this.format_GroupBox.sizer.add( this.reportFormat_Sizer, 100 );


   // -------------------------------------------------------------------------
   // IMAGES SELECTION
   // -------------------------------------------------------------------------

   if ( showTargetImage )
   {

      let hasActiveWindow = ImageWindow.activeWindow && ImageWindow.activeWindow.isWindow;
      if ( !hasActiveWindow )
         this.solverCfg.useActive = false;

      //

      this.activeWindow_RadioButton = new RadioButton( this );
      this.activeWindow_RadioButton.text = "Active window";
      this.activeWindow_RadioButton.checked = this.solverCfg.useActive == true;
      this.activeWindow_RadioButton.minWidth = labelWidth1;
      this.activeWindow_RadioButton.toolTip = "<p>The script solves the image in the active window.</p>";
      this.activeWindow_RadioButton.enabled = hasActiveWindow;
      this.activeWindow_RadioButton.onCheck = function( checked )
      {
         this.dialog.solverCfg.useActive = true;
         this.dialog.EnableFileControls();
      };

      this.activeWindow_Sizer = new HorizontalSizer;
      this.activeWindow_Sizer.addUnscaledSpacing( labelWidth1 + this.logicalPixelsToPhysical( 4 ) );
      this.activeWindow_Sizer.add( this.activeWindow_RadioButton );
      this.activeWindow_Sizer.addStretch();

      //

      this.listOfFiles_RadioButton = new RadioButton( this );
      this.listOfFiles_RadioButton.text = "List of files ";
      this.listOfFiles_RadioButton.checked = !this.solverCfg.useActive;
      this.listOfFiles_RadioButton.minWidth = labelWidth1;
      this.listOfFiles_RadioButton.toolTip = "<p>The script solves the images in a list of files.</p>";
      this.listOfFiles_RadioButton.onCheck = function( checked )
      {
         this.dialog.solverCfg.useActive = false;
         this.dialog.EnableFileControls();
      };

      this.listOfFiles_Sizer = new HorizontalSizer;
      this.listOfFiles_Sizer.addUnscaledSpacing( labelWidth1 + this.logicalPixelsToPhysical( 4 ) );
      this.listOfFiles_Sizer.add( this.listOfFiles_RadioButton );
      this.listOfFiles_Sizer.addStretch();

      //

      this.fileList_TreeBox = new TreeBox( this );
      this.fileList_TreeBox.rootDecoration = false;
      this.fileList_TreeBox.alternateRowColor = true;
      this.fileList_TreeBox.multipleSelection = true;
      this.fileList_TreeBox.headerVisible = false;
      this.fileList_TreeBox.setMinHeight( this.font.pixelSize * 11 );
      this.fileList_TreeBox.numberOfColumns = 2;
      this.fileList_TreeBox.showColumn( 1, false );
      this.fileList_TreeBox.toolTip = "<p>List of files for which the geometry will be computed.</p>";
      if ( this.solverCfg.imagesFiles )
      {
         for ( let i = 0; i < this.solverCfg.imagesFiles.length; ++i )
         {
            let node = new TreeBoxNode( this.fileList_TreeBox );
            node.setText( 0, this.solverCfg.imagesFiles[ i ] );
         }
      }
      else
         this.solverCfg.imagesFiles = new Array();

      //

      this.addFiles_Button = new PushButton( this );
      this.addFiles_Button.text = "Add files";
      this.addFiles_Button.toolTip = "Add files to the list";
      this.addFiles_Button.onMousePress = function()
      {
         let ofd = new OpenFileDialog;
         ofd.multipleSelections = true;
         ofd.caption = "Select files";
         ofd.filters = [
            [ "All supported formats", ".xisf", ".fit", ".fits", ".fts" ],
            [ "XISF Files", ".xisf" ],
            [ "FITS Files", ".fit", ".fits", ".fts" ]
         ];
         if ( ofd.execute() )
         {
            for ( let i = 0; i < ofd.fileNames.length; ++i )
            {
               this.dialog.solverCfg.imagesFiles.push( ofd.fileNames[ i ]);
               let node = new TreeBoxNode( this.dialog.fileList_TreeBox );
               node.checkable = false;
               node.setText( 0, ofd.fileNames[ i ] );
            }
            this.dialog.fileList_TreeBox.adjustColumnWidthToContents( 1 );
         }
      };

      //

      this.removeFiles_Button = new PushButton( this );
      this.removeFiles_Button.text = "Remove files";
      this.removeFiles_Button.toolTip = "<p>Removes the selected files from the list.</p>";
      this.removeFiles_Button.onMousePress = function()
      {
         for ( let i = this.dialog.fileList_TreeBox.numberOfChildren - 1; i >= 0; --i )
            if ( this.dialog.fileList_TreeBox.child( i ).selected )
            {
               this.dialog.solverCfg.imagesFiles.splice( i, 1 );
               this.dialog.fileList_TreeBox.remove( i );
            }
      };

      //

      this.clearFiles_Button = new PushButton( this );
      this.clearFiles_Button.text = "Clear files";
      this.clearFiles_Button.toolTip = "<p>Clears the list of files.</p>";
      this.clearFiles_Button.onMousePress = function()
      {
         this.dialog.fileList_TreeBox.clear();
         this.dialog.solverCfg.imagesFiles = new Array();
      };

      //

      this.fileButtons_Sizer = new VerticalSizer;
      this.fileButtons_Sizer.spacing = 6;
      this.fileButtons_Sizer.add( this.addFiles_Button );
      this.fileButtons_Sizer.add( this.removeFiles_Button );
      this.fileButtons_Sizer.addSpacing( 8 );
      this.fileButtons_Sizer.add( this.clearFiles_Button );
      this.fileButtons_Sizer.addStretch();

      //

      //

      this.files_Sizer2 = new HorizontalSizer;
      this.files_Sizer2.spacing = 6;
      this.files_Sizer2.add( this.fileList_TreeBox, 100 );
      this.files_Sizer2.add( this.fileButtons_Sizer );

      this.files_Control = new Control( this );
      this.files_Sizer = new VerticalSizer;
      this.files_Sizer.spacing = 6;
      this.files_Sizer.add( this.files_Sizer2, 100 );
      this.files_Control.sizer = this.files_Sizer;

      //

      this.EnableFileControls = function()
      {
         this.fileList_TreeBox.enabled = !this.solverCfg.useActive;
         this.addFiles_Button.enabled = !this.solverCfg.useActive;
         this.removeFiles_Button.enabled = !this.solverCfg.useActive;
         this.clearFiles_Button.enabled = !this.solverCfg.useActive;
         this.files_Control.visible = !this.solverCfg.useActive;
         this.setVariableHeight();
         this.targetImage_Control.setVariableHeight();
         this.targetImage_Control.adjustToContents();
         this.adjustToContents();
         if ( this.solverCfg.useActive )
         {
            this.targetImage_Control.setFixedSize();
            this.setFixedSize();
         }
         else
         {
            this.targetImage_Control.setMinHeight();
            this.setMinHeight();
         }
      };

      //

      this.targetImage_Control = new Control( this )
      this.targetImage_Control.sizer = new VerticalSizer;
      this.targetImage_Control.sizer.margin = 6;
      this.targetImage_Control.sizer.spacing = 4;
      this.targetImage_Control.sizer.add( this.activeWindow_Sizer );
      this.targetImage_Control.sizer.add( this.listOfFiles_Sizer );
      this.targetImage_Control.sizer.add( this.files_Control, 100 );

      this.targetImage_Section = new SectionBar( this, "Target Image" );
      this.targetImage_Section.setSection( this.targetImage_Control );
      this.targetImage_Section.onToggleSection = toggleSectionHandler;
   } // if ( showTargetImage )

  // -------------------------------------------------------------------------
   // CSV FILE SELECTION
   // -------------------------------------------------------------------------

   if ( showCSVData)
   {

      this.csvfileList_TreeBox = new TreeBox( this );
      this.csvfileList_TreeBox.rootDecoration = false;
      this.csvfileList_TreeBox.alternateRowColor = true;
      this.csvfileList_TreeBox.multipleSelection = true;
      this.csvfileList_TreeBox.headerVisible = false;
      this.csvfileList_TreeBox.setMinHeight( this.font.pixelSize * 11 );
      this.csvfileList_TreeBox.numberOfColumns = 2;
      this.csvfileList_TreeBox.showColumn( 1, false );
      this.csvfileList_TreeBox.toolTip = "<p>List of files for which the geometry will be computed.</p>";
      if ( this.solverCfg.dataFiles )
      {
         for ( let i = 0; i < this.solverCfg.dataFiles.length; ++i )
         {
            let node = new TreeBoxNode( this.csvfileList_TreeBox );
            node.setText( 0, this.solverCfg.dataFiles[ i ] );
         }
      }
      else
         this.solverCfg.dataFiles = new Array();

      //

      this.addCSVFiles_Button = new PushButton( this );
      this.addCSVFiles_Button.text = "Add files";
      this.addCSVFiles_Button.toolTip = "Add files to the list";
      this.addCSVFiles_Button.onMousePress = function()
      {
         let ofdc = new OpenFileDialog;
         ofdc.multipleSelections = true;
         ofdc.caption = "Select files";
         ofdc.filters = [
            [ "All supported formats", ".csv"]
         ];
         if ( ofdc.execute() )
         {
            for ( let i = 0; i < ofdc.fileNames.length; ++i )
            {
               this.dialog.solverCfg.dataFiles.push( ofdc.fileNames[ i ] );
               let node = new TreeBoxNode( this.dialog.csvfileList_TreeBox );
               node.checkable = false;
               node.setText( 0, ofdc.fileNames[ i ] );
			   logDebug("Fichier selectionné : " + this.dialog.solverCfg.dataFiles );

            }
            this.dialog.csvfileList_TreeBox.adjustColumnWidthToContents( 1 );
         }
      };

      //

      this.removeCsvFiles_Button = new PushButton( this );
      this.removeCsvFiles_Button.text = "Remove files";
      this.removeCsvFiles_Button.toolTip = "<p>Removes the selected files from the list.</p>";
      this.removeCsvFiles_Button.onMousePress = function()
      {
         for ( let i = this.dialog.csvfileList_TreeBox.numberOfChildren - 1; i >= 0; --i )
            if ( this.dialog.csvfileList_TreeBox.child( i ).selected )
            {
               this.dialog.solverCfg.dataFiles.splice( i, 1 );
               this.dialog.csvfileList_TreeBox.remove( i );
            }
      };

      //

      this.clearCsvFiles_Button = new PushButton( this );
      this.clearCsvFiles_Button.text = "Clear files";
      this.clearCsvFiles_Button.toolTip = "<p>Clears the list of files.</p>";
      this.clearCsvFiles_Button.onMousePress = function()
      {
         this.dialog.csvfileList_TreeBox.clear();
         this.dialog.solverCfg.dataFiles = new Array();
      };

      //

      this.fileCsvButtons_Sizer = new VerticalSizer;
      this.fileCsvButtons_Sizer.spacing = 6;
      this.fileCsvButtons_Sizer.add( this.addCSVFiles_Button );
      this.fileCsvButtons_Sizer.add( this.removeCsvFiles_Button );
      this.fileCsvButtons_Sizer.addSpacing( 8 );
      this.fileCsvButtons_Sizer.add( this.clearCsvFiles_Button );
      this.fileCsvButtons_Sizer.addStretch();

      //

      this.filesCSV_Sizer2 = new HorizontalSizer;
      this.filesCSV_Sizer2.spacing = 6;
      this.filesCSV_Sizer2.add( this.csvfileList_TreeBox, 100 );
      this.filesCSV_Sizer2.add( this.fileCsvButtons_Sizer );

      this.filesCSV_Control = new Control( this );
      this.filesCSV_Sizer = new VerticalSizer;
      this.filesCSV_Sizer.spacing = 6;
      this.filesCSV_Sizer.add( this.filesCSV_Sizer2, 100 );
      this.filesCSV_Control.sizer = this.filesCSV_Sizer;

      //

      this.EnableCsvFileControls = function()
      {
         this.csvfileList_TreeBox.enabled = !this.solverCfg.useActive;
         this.addCSVFiles_Button.enabled = !this.solverCfg.useActive;
         this.removeCsvFiles_Button.enabled = !this.solverCfg.useActive;
         this.clearCsvFiles_Button.enabled = !this.solverCfg.useActive;
         this.filesCSV_Control.visible = !this.solverCfg.useActive;
         this.setVariableHeight();
         this.CSVData_Control.setVariableHeight();
         this.CSVData_Control.adjustToContents();
         this.adjustToContents();
         if ( this.solverCfg.useActive )
         {
            this.CSVData_Control.setFixedSize();
            this.setFixedSize();
         }
         else
         {
            this.CSVData_Control.setMinHeight();
            this.setMinHeight();
         }
      };

      //

      this.CSVData_Control = new Control( this )
      this.CSVData_Control.sizer = new VerticalSizer;
      this.CSVData_Control.sizer.margin = 6;
      this.CSVData_Control.sizer.spacing = 4;
      this.CSVData_Control.sizer.add( this.filesCSV_Control, 100 );

      this.CSVData_Section = new SectionBar( this, "CSV Files" );
      this.CSVData_Section.setSection( this.CSVData_Control );
      this.CSVData_Section.onToggleSection = toggleSectionHandler;
   } // if ( showCSVData)

   this.newInstanceButton = new ToolButton( this );
   this.newInstanceButton.icon = this.scaledResource( ":/process-interface/new-instance.png" );
   this.newInstanceButton.setScaledFixedSize( 24, 24 );
   this.newInstanceButton.toolTip = "New Instance";
   this.newInstanceButton.onMousePress = function()
   {
      if ( !this.dialog.Validate() )
         return;

      this.hasFocus = true;

      this.dialog.metadata.SaveParameters();
      this.dialog.solverCfg.SaveParameters();

      this.pushed = false;
      this.dialog.newInstance();
   };

   this.reset_Button = new ToolButton( this );
   this.reset_Button.icon = this.scaledResource( ":/icons/reload.png" );
   this.reset_Button.setScaledFixedSize( 24, 24 );
   this.reset_Button.toolTip = "<p>Resets script settings to factory-default values.</p>" +
      "<p>This action closes this dialog window, so the script must be executed again.</p>";
   this.reset_Button.onClick = function()
   {
      let msg = new MessageBox( "Do you really want to reset all settings to their default values?",
         TITLE, StdIcon_Warning, StdButton_Yes, StdButton_No );
      if ( msg.execute() == StdButton_Yes )
      {
         this.dialog.solverCfg.ResetSettings();
         this.dialog.resetRequest = true;
         this.dialog.cancel();
      }
   };

   this.help_Button = new ToolButton( this );
   this.help_Button.icon = this.scaledResource( ":/process-interface/browse-documentation.png" );
   this.help_Button.setScaledFixedSize( 24, 24 );
   this.help_Button.toolTip = "<p>Browse Documentation</p>";
   this.help_Button.onClick = function()
   {
      Dialog.browseScriptDocumentation( "MPCReport" );
   };

   this.ok_Button = new PushButton( this );
   this.ok_Button.text = "OK";
   this.ok_Button.icon = this.scaledResource( ":/icons/ok.png" );
   this.ok_Button.onClick = function()
   {
      if ( !this.dialog.Validate() )
         return;
      if (!isFormatSelectedMain) {
         console.warningln("Report formet not selected");
         return;
      }
      this.dialog.ok();
   };
   this.cancel_Button = new PushButton( this );
   this.cancel_Button.text = "Cancel";
   this.cancel_Button.icon = this.scaledResource( ":/icons/cancel.png" );
   this.cancel_Button.onClick = function()
   {
      this.dialog.cancel();
   };

   this.buttons_Sizer = new HorizontalSizer;
   this.buttons_Sizer.spacing = 6;
   this.buttons_Sizer.add( this.newInstanceButton );
   this.buttons_Sizer.add( this.reset_Button );
   this.buttons_Sizer.add( this.help_Button );
   this.buttons_Sizer.addStretch();
   this.buttons_Sizer.add( this.ok_Button );
   this.buttons_Sizer.add( this.cancel_Button );

   // -------------------------------------------------------------------------
   // Global sizer
   // -------------------------------------------------------------------------

   this.sizer = new VerticalSizer;
   this.sizer.margin = 8;
   this.sizer.spacing = 6;
   this.sizer.add( this.helpLabel );
   this.sizer.add( this.format_GroupBox ) // REPORT
   this.sizer.addSpacing( 4 );
   if ( showTargetImage )
   {
      this.sizer.add( this.targetImage_Section );
      this.sizer.add( this.targetImage_Control, 100 );
   }
   if ( showCSVData )
   {
      this.sizer.add( this.CSVData_Section );
      this.sizer.add( this.CSVData_Control, 100 );
   }


   this.sizer.add( this.buttons_Sizer );

   this.windowTitle = "MPC Report Builder Script";

   if ( showTargetImage )
   {
      this.EnableFileControls(); // which changes size constraints
      this.ensureLayoutUpdated();
      this.setFixedWidth();
   }
   else if ( showCSVData )
   {
      this.EnableFileControls(); // which changes size constraints
      this.ensureLayoutUpdated();
      this.setFixedWidth();
   }

   else
   {
      this.ensureLayoutUpdated();
      this.adjustToContents();
      this.setFixedSize();
   }
   this.helpLabel.setFixedSize();

    this.Validate = function()
   {
      try
      {
         if (!isFormatSelectedMain )
         {
          throw "Manque un choix de format de rapport";

         }
         return true;
      }
      catch ( ex )
      {
         new MessageBox( ex, TITLE, StdIcon_Error ).execute();
         return false;
      }
   };

}





MPCReportDialog.prototype = new Dialog;

function MPCReport() {

  let error;
  this.solverCfg = new MPCReportConfiguration( SETTINGS_MODULE_SCRIPT );
  this.metadata = new ImageMetadata( SETTINGS_MODULE_SCRIPT );


   this.Init = function( w, prioritizeSettings )
   {

     this.solverCfg.LoadSettings();
      this.solverCfg.LoadParameters();
   };
   this.builder = new MPCBuilder();   //if (isFormatSelectedMain) {


     this.MPCReport = function( targetWindow ) {
     };

     this.SaveImage = function( window ) {
      };

	  this.updateFormatSelection = function (format) {
		  isFormatSelectedMain = this.builder.setFormatReport (1);
	  }



};


function main()
{


   if ( Parameters.getBoolean( "resetSettingsAndExit" ) )
   {
      Settings.remove( SETTINGS_MODULE );
      return;
   }


   if ( Parameters.getBoolean( "resetSettings" ) )
      Settings.remove( SETTINGS_MODULE );

   let solver = new MPCReport;
   logDebug("solver declared");
   if ( Parameters.isViewTarget )
   {
      let targetWindow = Parameters.targetView.window;

      solver.Init( Parameters.targetView.window );

      if ( solver.MPCReport( targetWindow ) )
      {
         solver.metadata.SaveSettings();
         logDebug("step2")
         // Print result
         console.writeln( "<end><cbr><br>MPC Report building script version ", MPCREPORTVERSION );
         console.writeln( "=".repeat( 79 ) );
         console.writeln( targetWindow.astrometricSolutionSummary() );
         ++__PJSR_AdpImageSolver_SuccessCount;
      }
   }
   else
   {
      let targetWindow = ImageWindow.activeWindow;
      logDebug("step3");
      if ( Parameters.getBoolean( "non_interactive" ) )
         solver.Init( targetWindow, false /*prioritizeSettings*/ );
      else
      {
         let dialog;
         for ( ;; )
         {
            solver.Init( targetWindow, false /*prioritizeSettings*/ );
            dialog = new MPCReportDialog( solver.solverCfg, solver.metadata, solver.builder, true /*showTargetImage*/,true );
            logDebug("step4");

            if ( dialog.execute() ) {
               logDebug ("step3bis");
               solver.builder.buildReport(dialog.solverCfg.imagesFiles,dialog.solverCfg.dataFiles);
               break;
            }
            if ( !dialog.resetRequest )
               return;
            logDebug("step 4bis");
            solver = new MPCReport();
         }

         if ( solver.error )
         {
            console.criticalln( solver.error );
            return;
         }
         logDebug("step5");
         solver.solverCfg = dialog.solverCfg;
         solver.solverCfg.SaveSettings();

         solver.metadata = dialog.metadata;
         solver.metadata.SaveSettings();
      }

      if ( solver.solverCfg.useActive )
      {
         logDebug("step6");
         if ( solver.MPCReport( targetWindow ) )
         {
            solver.metadata.SaveSettings();

            // Print result
            console.writeln( "<end><cbr><br>MPC Report building script version ", MPCREPORTVERSION );
            console.writeln( "=".repeat( 79 ) );
            console.writeln( targetWindow.astrometricSolutionSummary() );
            ++__PJSR_AdpImageSolver_SuccessCount;
         }
      }
      else
      {
         logDebug("step7");
         if ( solver.solverCfg.dataFiles.length == 0| solver.solverCfg.imagesFiles.length == 0 )
            throw "No data files have been selected.";
         let errorList = [];
         for ( let i = 0; i < solver.solverCfg.imagesFiles.length; ++i )
         {
            let filePath = solver.solverCfg.imagesFiles[ i ];
            let fileWindow = null;
            try
            {
               console.writeln( "<end><cbr><br>" + "*".repeat( 32 ) );
               console.writeln( "Processing image ", filePath );

            }
            catch ( ex )
            {
               console.writeln( "*".repeat( 32 ) );
               console.writeln( "Error in image <raw>" + filePath + "</raw>: " + ex );
               errorList.push(
               {
                  id: File.extractNameAndExtension( filePath ),
                  message: ex
               } );
            }

            if ( fileWindow )
               fileWindow.forceClose();

            gc( true );
         }

         console.writeln();
         if ( errorList.length > 0 )
         {
            console.warningln( "<end><cbr>** Warning: Process finished with errors:" );
            for ( let i = 0; i < errorList.length; ++i )
               console.criticalln( "  " + errorList[ i ].id + ": " + errorList[ i ].message );
         }
         else
            console.noteln( "<end><cbr>* Process finished without errors." );
      }
   }
}


main();
