import React, { useEffect, useRef, useState } from "react";
import {
  SpreadsheetComponent,
  SheetsDirective,
  SheetDirective,
  RangesDirective,
  RangeDirective,
} from "@syncfusion/ej2-react-spreadsheet";

const SpreadSheet = ({ data, loader }) => {
  const spreadsheetRef = useRef(null);

  return (
    <>
      {loader ? (
        <h2>Loading...</h2>
      ) : (
        <SpreadsheetComponent ref={spreadsheetRef}>
          <SheetsDirective>
            <SheetDirective>
              <RangesDirective>
                <RangeDirective dataSource={data}></RangeDirective>
              </RangesDirective>
            </SheetDirective>
          </SheetsDirective>
        </SpreadsheetComponent>
      )}
    </>
  );
};

export default SpreadSheet;
