import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View
} from "react-native";

const STATIONS = [
  { name: "Amsterdam Centraal", region: "Amsterdam, Netherlands", distance: 8.4, eta: 12 },
  { name: "Utrecht Centraal", region: "Utrecht, Netherlands", distance: 36.2, eta: 28 },
  { name: "Rotterdam Centraal", region: "Rotterdam, Netherlands", distance: 58.7, eta: 42 },
  { name: "Den Haag Centraal", region: "The Hague, Netherlands", distance: 51.1, eta: 39 },
  { name: "Bruxelles-Midi", region: "Brussels, Belgium", distance: 165.4, eta: 118 },
  { name: "London St Pancras", region: "London, United Kingdom", distance: 357.9, eta: 241 }
];

const LEAD_OPTIONS = [2, 5, 10, 15, 20];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [step, setStep] = useState("destination");
  const [query, setQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState(null);
  const [leadMinutes, setLeadMinutes] = useState(5);
  const [customMinutes, setCustomMinutes] = useState("");
  const [alarm, setAlarm] = useState(null);
  const [snoozeUsed, setSnoozeUsed] = useState(false);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return STATIONS.slice(0, 3);
    return STATIONS.filter((station) => {
      return `${station.name} ${station.region}`.toLowerCase().includes(normalized);
    });
  }, [query]);

  useEffect(() => {
    if (!alarm || screen === "fired") return undefined;

    const timer = setInterval(() => {
      setAlarm((current) => {
        if (!current) return current;

        const nextDistance = Math.max(0.4, current.distance - 0.2);
        const nextEta = Math.max(1, Math.round(nextDistance * 1.4));

        if (nextEta <= current.leadMinutes) {
          fireAlarm(current);
        }

        return {
          ...current,
          distance: nextDistance,
          eta: nextEta
        };
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [alarm, screen]);

  function resetSetup() {
    setStep("destination");
    setQuery("");
    setSelectedStation(null);
    setCustomMinutes("");
    setLeadMinutes(5);
  }

  function openSetup() {
    resetSetup();
    setScreen("setup");
  }

  function chooseStation(station) {
    setSelectedStation(station);
    setStep("lead");
  }

  function confirmAlarm() {
    if (!selectedStation) return;

    const customValue = Number(customMinutes);
    const finalLead = Number.isFinite(customValue) && customValue > 0 ? customValue : leadMinutes;

    setAlarm({
      station: selectedStation,
      leadMinutes: finalLead,
      distance: selectedStation.distance,
      eta: selectedStation.eta
    });
    setSnoozeUsed(false);
    setScreen("home");
  }

  function fireAlarm(currentAlarm = alarm) {
    if (!currentAlarm) return;
    Vibration.vibrate([0, 700, 250, 700]);
    setScreen("fired");
  }

  function cancelAlarm() {
    setAlarm(null);
    setScreen("home");
  }

  function snoozeAlarm() {
    if (snoozeUsed) return;
    setSnoozeUsed(true);
    setScreen("home");
  }

  function dismissAlarm() {
    setAlarm(null);
    setScreen("home");
  }

  function editAlarm() {
    if (!alarm) return;
    setSelectedStation(alarm.station);
    setLeadMinutes(alarm.leadMinutes);
    setCustomMinutes("");
    setStep("lead");
    setScreen("setup");
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        {screen === "home" && (
          <ScrollView contentContainerStyle={styles.screen}>
            <View style={styles.topline}>
              <View>
                <Text style={styles.kicker}>Location alarm</Text>
                <Text style={styles.title}>StopAlert</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Permission status"
                style={styles.permissionButton}
                onPress={() =>
                  Alert.alert(
                    "Permissions",
                    "The production app will request Always location and notifications so alarms can fire while the phone is locked."
                  )
                }
              >
                <Text style={styles.permissionMark}>!</Text>
              </Pressable>
            </View>

            {!alarm && (
              <View style={styles.centerStage}>
                <RouteMark />
                <Text style={styles.heroTitle}>Wake up before your stop.</Text>
                <Text style={styles.bodyText}>
                  Pick a destination station and StopAlert handles the rest on-device.
                </Text>
                <Pressable style={styles.primaryButton} onPress={openSetup}>
                  <Text style={styles.primaryText}>Set Alarm</Text>
                </Pressable>
              </View>
            )}

            {alarm && (
              <View style={styles.card}>
                <View style={styles.topline}>
                  <View style={styles.flexOne}>
                    <Text style={styles.label}>Active alarm</Text>
                    <Text style={styles.cardTitle}>{alarm.station.name}</Text>
                  </View>
                  <View style={styles.pulse} />
                </View>
                <View style={styles.metricGrid}>
                  <Metric value={`${alarm.distance.toFixed(1)} km`} label="remaining" />
                  <Metric value={`${alarm.eta} min`} label="estimated" />
                  <Metric value={`${alarm.leadMinutes} min`} label="lead time" />
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(94, Math.max(12, 100 - alarm.distance * 4))}%` }
                    ]}
                  />
                </View>
                <Text style={styles.note}>
                  Tracking continues in the background. No network calls after setup.
                </Text>
                <View style={styles.buttonRow}>
                  <Pressable style={styles.secondaryButton} onPress={editAlarm}>
                    <Text style={styles.secondaryText}>Edit</Text>
                  </Pressable>
                  <Pressable style={styles.dangerButton} onPress={cancelAlarm}>
                    <Text style={styles.dangerText}>Cancel</Text>
                  </Pressable>
                </View>
                <Pressable style={styles.testButton} onPress={() => fireAlarm()}>
                  <Text style={styles.testButtonText}>Test Alert</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}

        {screen === "setup" && (
          <ScrollView contentContainerStyle={styles.screen}>
            <View style={styles.navline}>
              <Pressable onPress={() => setScreen("home")}>
                <Text style={styles.textButton}>Cancel</Text>
              </Pressable>
              <Text style={styles.navTitle}>Set Alarm</Text>
              <View style={styles.navSpacer} />
            </View>

            {step === "destination" && (
              <View style={styles.card}>
                <Text style={styles.stepCount}>Step 1 of 2</Text>
                <Text style={styles.sectionTitle}>Destination station</Text>
                <Text style={styles.inputLabel}>Search</Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Station name"
                  placeholderTextColor="#8b98a8"
                  autoCapitalize="words"
                  style={styles.input}
                />
                <Text style={styles.listLabel}>
                  {query.trim() ? "Suggestions" : "Recent destinations"}
                </Text>
                {suggestions.map((station) => (
                  <StationRow key={station.name} station={station} onPress={chooseStation} />
                ))}
              </View>
            )}

            {step === "lead" && selectedStation && (
              <View style={styles.card}>
                <Text style={styles.stepCount}>Step 2 of 2</Text>
                <Text style={styles.sectionTitle}>Lead time</Text>
                <Text style={styles.bodyText}>
                  Alert me before arriving at <Text style={styles.strong}>{selectedStation.name}</Text>.
                </Text>
                <View style={styles.leadGrid}>
                  {LEAD_OPTIONS.map((minutes) => (
                    <Pressable
                      key={minutes}
                      style={[
                        styles.leadOption,
                        leadMinutes === minutes && !customMinutes ? styles.leadSelected : null
                      ]}
                      onPress={() => {
                        setLeadMinutes(minutes);
                        setCustomMinutes("");
                      }}
                    >
                      <Text
                        style={[
                          styles.leadNumber,
                          leadMinutes === minutes && !customMinutes ? styles.leadSelectedText : null
                        ]}
                      >
                        {minutes}
                      </Text>
                      <Text
                        style={[
                          styles.leadUnit,
                          leadMinutes === minutes && !customMinutes ? styles.leadSelectedUnit : null
                        ]}
                      >
                        min
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.inputLabel}>Custom minutes</Text>
                <TextInput
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  placeholder="Optional"
                  placeholderTextColor="#8b98a8"
                  keyboardType="number-pad"
                  style={styles.input}
                />
                <View style={styles.permissionCard}>
                  <Text style={styles.permissionTitle}>Permissions needed</Text>
                  <Text style={styles.permissionText}>
                    Always-on location and notifications keep the alarm reliable after you lock the
                    phone.
                  </Text>
                </View>
                <Pressable style={styles.primaryButton} onPress={confirmAlarm}>
                  <Text style={styles.primaryText}>Set Alarm</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}

        {screen === "fired" && alarm && (
          <View style={[styles.screen, styles.alertScreen]}>
            <AlertRings />
            <Text style={styles.alertKicker}>Arriving soon</Text>
            <Text style={styles.alertTitle}>{alarm.station.name}</Text>
            <Text style={styles.alertText}>
              You are about {alarm.leadMinutes} minutes from arrival.
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.alertSecondary, snoozeUsed ? styles.disabledButton : null]}
                onPress={snoozeAlarm}
                disabled={snoozeUsed}
              >
                <Text style={styles.secondaryText}>Snooze</Text>
              </Pressable>
              <Pressable style={styles.alertPrimary} onPress={dismissAlarm}>
                <Text style={styles.primaryText}>Dismiss</Text>
              </Pressable>
            </View>
            <Text style={styles.alertFootnote}>
              {snoozeUsed
                ? "Snooze has already been used for this alarm."
                : "Snooze is available once for 2 minutes."}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RouteMark() {
  return (
    <View style={styles.routeMark}>
      <View style={styles.routeLine} />
      <View style={[styles.routeDot, styles.routeDotStart]} />
      <View style={[styles.routeDot, styles.routeDotMiddle]} />
      <View style={[styles.routeDot, styles.routeDotEnd]} />
    </View>
  );
}

function Metric({ value, label }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StationRow({ station, onPress }) {
  return (
    <Pressable style={styles.stationRow} onPress={() => onPress(station)}>
      <View style={styles.stationDot} />
      <View style={styles.flexOne}>
        <Text style={styles.stationName}>{station.name}</Text>
        <Text style={styles.stationRegion}>{station.region}</Text>
      </View>
    </Pressable>
  );
}

function AlertRings() {
  return (
    <View style={styles.alertRings}>
      <View style={styles.ringOuter} />
      <View style={styles.ringMiddle} />
      <View style={styles.ringCenter} />
    </View>
  );
}

const colors = {
  ink: "#14213d",
  muted: "#667085",
  line: "#d8dee8",
  surface: "#f3f6f8",
  panel: "#ffffff",
  accent: "#0f8b8d",
  accentDark: "#0b686a",
  warn: "#df6b2e",
  danger: "#c2413b"
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.surface
  },
  keyboard: {
    flex: 1
  },
  screen: {
    flexGrow: 1,
    padding: 22,
    paddingTop: 18
  },
  topline: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between"
  },
  navline: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28
  },
  navTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  navSpacer: {
    width: 54
  },
  kicker: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38
  },
  permissionButton: {
    alignItems: "center",
    backgroundColor: "#fff4e8",
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  permissionMark: {
    color: "#9a4a12",
    fontSize: 18,
    fontWeight: "900"
  },
  centerStage: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 28
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 35,
    marginTop: 24
  },
  bodyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8
  },
  strong: {
    color: colors.ink,
    fontWeight: "900"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 54,
    paddingHorizontal: 20
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900"
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 28,
    padding: 20,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28
  },
  flexOne: {
    flex: 1
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 31,
    marginTop: 3
  },
  pulse: {
    backgroundColor: colors.accent,
    borderRadius: 7,
    height: 14,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    width: 14
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
    marginTop: 24
  },
  metric: {
    alignItems: "center",
    backgroundColor: "#f5f8fa",
    borderRadius: 14,
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 12
  },
  metricValue: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  progressTrack: {
    backgroundColor: "#e6edf0",
    borderRadius: 999,
    height: 10,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: colors.warn,
    borderRadius: 999,
    height: "100%"
  },
  note: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 16
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#e7eef0",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 54
  },
  secondaryText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: "#fff0ef",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 54
  },
  dangerText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "900"
  },
  testButton: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 46
  },
  testButtonText: {
    color: colors.accentDark,
    fontWeight: "900"
  },
  textButton: {
    color: colors.accentDark,
    fontSize: 15,
    fontWeight: "900"
  },
  stepCount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
    marginBottom: 14,
    marginTop: 4
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 14
  },
  input: {
    backgroundColor: "#f9fbfc",
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14
  },
  listLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 18,
    textTransform: "uppercase"
  },
  stationRow: {
    alignItems: "center",
    backgroundColor: "#f5f8fa",
    borderRadius: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  stationDot: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    height: 12,
    width: 12
  },
  stationName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  stationRegion: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  leadGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
    marginTop: 22
  },
  leadOption: {
    alignItems: "center",
    backgroundColor: "#eef3f5",
    borderRadius: 16,
    flex: 1,
    height: 70,
    justifyContent: "center"
  },
  leadSelected: {
    backgroundColor: colors.accent
  },
  leadNumber: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  leadUnit: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    marginTop: -2
  },
  leadSelectedText: {
    color: "#ffffff"
  },
  leadSelectedUnit: {
    color: "rgba(255,255,255,0.78)"
  },
  permissionCard: {
    backgroundColor: "#fff8ed",
    borderColor: "#f2d8b8",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 18,
    padding: 14
  },
  permissionTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  permissionText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4
  },
  routeMark: {
    height: 150,
    position: "relative"
  },
  routeLine: {
    borderColor: "#8fb8b6",
    borderStyle: "dashed",
    borderTopWidth: 3,
    left: 24,
    position: "absolute",
    right: 24,
    top: 76
  },
  routeDot: {
    backgroundColor: colors.panel,
    borderColor: colors.accent,
    borderRadius: 15,
    borderWidth: 7,
    height: 30,
    position: "absolute",
    top: 61,
    width: 30
  },
  routeDotStart: {
    left: 18
  },
  routeDotMiddle: {
    borderColor: colors.warn,
    left: "50%",
    marginLeft: -15
  },
  routeDotEnd: {
    right: 18
  },
  alertScreen: {
    alignItems: "center",
    backgroundColor: colors.ink,
    justifyContent: "center"
  },
  alertKicker: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 26,
    textTransform: "uppercase"
  },
  alertTitle: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
    marginTop: 14,
    textAlign: "center"
  },
  alertText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center"
  },
  alertSecondary: {
    alignItems: "center",
    backgroundColor: "#e7eef0",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 54
  },
  alertPrimary: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 54
  },
  alertFootnote: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 16,
    textAlign: "center",
    textTransform: "uppercase"
  },
  disabledButton: {
    opacity: 0.5
  },
  alertRings: {
    height: 210,
    position: "relative",
    width: 210
  },
  ringOuter: {
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 105,
    borderWidth: 2,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  ringMiddle: {
    backgroundColor: "rgba(15,139,141,0.24)",
    borderColor: "rgba(15,139,141,0.72)",
    borderRadius: 71,
    borderWidth: 2,
    bottom: 34,
    left: 34,
    position: "absolute",
    right: 34,
    top: 34
  },
  ringCenter: {
    backgroundColor: "#ffffff",
    borderRadius: 31,
    bottom: 74,
    left: 74,
    position: "absolute",
    right: 74,
    top: 74
  }
});
