# 🖥️ SERVERS
An open-source ModuleScript for monitoring all active game servers.
Showcase: [https://streamable.com/7l6wbo](https://streamable.com/7l6wbo)

# ⚡ Features:
1. Real-time Tracking: Automatically detects when new a server is created or when an existing server is closed.
2. Detailed Data: The server data contain are `PlaceId`, `JobId`, `Players`, `CreatedAt`, `Location`.
3. Reliability: The built-in Retry function ensures that data will be sent.

# 📦 Installation:
1. Download the `Servers.rbxm` file. [https://github.com/phongEloper/Servers-ModuleScript/releases](https://github.com/phongEloper/Servers-ModuleScript/releases)
2. Place it anywhere you want in the game.

# 🛠️ Usage:
1. Init the Servers:
```
local module = require(path.to.module) -- path to module

local Servers = module.new()
Servers:Init()
```
2. Connect to events:
```
-- Connect to events
Servers.ServerAdded:Connect(function(ServerData)
    print("Server added", ServerData)
end)
Servers.ServerRemoved:Connect(function(ServerData)
    print("Server removed", ServerData)
end)
```
3. Check all active servers (Bonus):
```
while task.wait(3) do
    print("Active servers: ", Servers:GetServerCount(), Servers:GetServers())
end
```

# ⚙️ Configuration:
1. `UpdateDataDelay` is the delay interval used to update ServerData multiple times.
2. `UpdateRegularlyDelay` is the delay interval used to update ServerData continuously over a long period.

# 📜 API Reference:
Constructor:
```
local Servers = module.new() -- New server data
```
Methods:
```
Servers:Init() -- Initializes the module.
Servers:Shutdown() -- Stops the module.

Servers:GetServers() -- Returns all active servers.
Servers:GetServerData() -- Returns the data of the server.
Servers:GetServerCount() -- Returns the total number of active servers in the game.
Servers:GetServerLocation() -- Returns string of the current server location.
```
Events:
```
Servers.ServerAdded: Fires when a server is created.
Servers.ServerRemoved: Fires when a server is closed or shutdown.
```
