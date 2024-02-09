import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DemoApp from './Powerbi'
import { models, Report, Embed, service, Page } from 'powerbi-client';
import { sampleReportUrl } from '../public/constants.js';


function App() {
  const [isEmbedded, setIsEmbedded] = useState(false);

  const [sampleReportConfig, setReportConfig] = useState({
    type: 'report',
    embedUrl: undefined,
    tokenType: models.TokenType.Embed,
    accessToken: undefined,
    settings: undefined,
});

const embedReport = async () => {
  console.log('Embed Report clicked');
  const reportConfigResponse = await fetch(sampleReportUrl);

  if (reportConfigResponse === null) {
      return;
  }

  if (!reportConfigResponse?.ok) {
      console.error(`Failed to fetch config for report. Status: ${ reportConfigResponse.status } ${ reportConfigResponse.statusText }`);
      return;
  }

  const reportConfig = await reportConfigResponse.json();

  setReportConfig({
      ...sampleReportConfig,
      embedUrl: reportConfig.EmbedUrl,
      accessToken: reportConfig.EmbedToken.Token
  });
  setIsEmbedded(true);

  // setMessage('Use the buttons above to interact with the report using Power BI Client APIs.');
};

  return (
    <>
      <h1>Here</h1>
      <button onClick={embedReport} className="embed-report">Embed Report</button>

      <DemoApp isEmbedded={isEmbedded} sampleReportConfig={sampleReportConfig} />
    </>
  )
}

export default App
