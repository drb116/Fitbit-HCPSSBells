function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Time Settings</Text>}>
        <Select
          label="Time Option"
          settingsKey="timeOption"
          options={[
            {name: "Regular Bells",
            value: 0},
             {name: "Flex Time",
            value: 1},
            {name: "3 hour Early Dismissal",
            value: 2},
            {name: "2 hour Delay",
            value: 2},
             {name: "Normal Time",
            value: 4}
          ]}
        />
      </Section>
      <Section
        title={<Text bold align="center">Lunch Period</Text>}>
        <Select
          label="Lunch Option"
          settingsKey="lunchOption"
          options={[
            {name: "A Lunch",
            value: 0},
             {name: "B Lunch",
            value: 1},
            {name: "C Lunch",
            value: 2},
            {name: "D Lunch",
            value: 2}
          ]}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
