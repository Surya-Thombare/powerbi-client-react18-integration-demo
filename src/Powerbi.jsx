import React, { useState, useEffect } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import 'powerbi-report-authoring';

import './DemoApp.css';

function DemoApp({isEmbedded, sampleReportConfig}) {
    const [report, setReport] = useState();
    const [displayMessage, setMessage] = useState('');

    const reportClass = 'report-container';

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
        </>
    );


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

    return (
        <div className="container">
            {/* {header} */}
            <div className="controls">
                {controlButtons}
                {isEmbedded ? reportComponent : null}
            </div>
            {/* {footer} */}
        </div>
    );
}

export default DemoApp;
