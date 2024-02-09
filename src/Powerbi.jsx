import React, { useState, useEffect } from 'react';
import { models, Report, Embed, service, Page } from 'powerbi-client';
import { IHttpPostMessageResponse } from 'http-post-message';
import { PowerBIEmbed } from 'powerbi-client-react';
import 'powerbi-report-authoring';

import { sampleReportUrl } from '../public/constants.js';
import './DemoApp.css';

function DemoApp() {
    const [report, setReport] = useState();
    const [isEmbedded, setIsEmbedded] = useState(false);
    const [displayMessage, setMessage] = useState(`The report is bootstrapped. Click the Embed Report button to set the access token`);

    const reportClass = 'report-container';

    const [sampleReportConfig, setReportConfig] = useState({
        type: 'report',
        embedUrl: undefined,
        tokenType: models.TokenType.Embed,
        accessToken: undefined,
        settings: undefined,
    });

    const [eventHandlersMap, setEventHandlersMap] = useState(new Map([
        ['loaded', () => console.log('Report has loaded')],
        ['rendered', () => console.log('Report has rendered')],
        ['error', (event) => {
            if (event) {
                console.error(event.detail);
            }
        }],
        ['visualClicked', () => console.log('visual clicked')],
        ['pageChanged', (event) => console.log(event)],
    ]));

    useEffect(() => {
        if (report) {
            report.setComponentTitle('Embedded Report');
        }
    }, [report]);

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

        setMessage('Use the buttons above to interact with the report using Power BI Client APIs.');
    };

    const hideFilterPane = async () => {
        if (!report) {
            setDisplayMessageAndConsole('Report not available');
            return;
        }

        const settings = {
            panes: {
                filters: {
                    expanded: false,
                    visible: false,
                },
            },
        };

        try {
            const response = await report.updateSettings(settings);
            setDisplayMessageAndConsole('Filter pane is hidden.');
            return response;
        } catch (error) {
            console.error(error);
            return;
        }
    };

    const setDataSelectedEvent = () => {
        setEventHandlersMap(new Map([
            ...eventHandlersMap,
            ['dataSelected', (event) => console.log(event)],
        ]));

        setMessage('Data Selected event set successfully. Select data to see event in console.');
    }

    const changeVisualType = async () => {
        if (!report) {
            setDisplayMessageAndConsole('Report not available');
            return;
        }

        const activePage = await report.getActivePage();

        if (!activePage) {
            setMessage('No Active page found');
            return;
        }

        try {
            const visual = await activePage.getVisualByName('VisualContainer6');
            const response = await visual.changeType('lineChart');
            setDisplayMessageAndConsole(`The ${visual.type} was updated to lineChart.`);
            return response;
        } catch (error) {
            if (error === 'PowerBIEntityNotFound') {
                console.log('No Visual found with that name');
            } else {
                console.log(error);
            }
        }
    };

    const setDisplayMessageAndConsole = (message) => {
        setMessage(message);
        console.log(message);
    }

    const controlButtons = isEmbedded ? (
        <>
            <button onClick={changeVisualType}>Change visual type</button>
            <button onClick={hideFilterPane}>Hide filter pane</button>
            <button onClick={setDataSelectedEvent}>Set event</button>
            <label className="display-message">{displayMessage}</label>
        </>
    ) : (
        <>
            <label className="display-message position">{displayMessage}</label>
            <button onClick={embedReport} className="embed-report">Embed Report</button>
        </>
    );

    const header = <div className="header">Power BI Embedded React Component Demo</div>;

    const reportComponent = (
        <PowerBIEmbed
            embedConfig={sampleReportConfig}
            eventHandlers={eventHandlersMap}
            cssClassName={reportClass}
            getEmbeddedComponent={(embedObject) => {
                console.log(`Embedded object of type "${embedObject.embedtype}" received`);
                setReport(embedObject);
            }}
        />
    );

    const footer = (
        <div className="footer">
            <p>This demo is powered by Power BI Embedded Analytics</p>
            <label className="separator-pipe">|</label>
            <img title="Power-BI" alt="PowerBI_Icon" className="footer-icon" src="./assets/PowerBI_Icon.png" />
            <p>Explore our<a href="https://aka.ms/pbijs/" target="_blank" rel="noreferrer noopener">Playground</a></p>
            <label className="separator-pipe">|</label>
            <img title="GitHub" alt="GitHub_Icon" className="footer-icon" src="./assets/GitHub_Icon.png" />
            <p>Find the<a href="https://github.com/microsoft/PowerBI-client-react" target="_blank" rel="noreferrer noopener">source code</a></p>
        </div>
    );

    return (
        <div className="container">
            {header}
            <div className="controls">
                {controlButtons}
                {isEmbedded ? reportComponent : null}
            </div>
            {footer}
        </div>
    );
}

export default DemoApp;
