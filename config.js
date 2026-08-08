// ─── Server Configuration ─────────────────────────────────────────────────────
// Android emulator routes localhost through 10.0.2.2.
// If testing on a physical device, replace with your machine's LAN IP,
// e.g. 'http://192.168.1.x:5000'

const config = {
  serverPath: 'http://10.0.2.2:5000',
};

export default config;
