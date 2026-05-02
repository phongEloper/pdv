window.portfolioData = {
  available: false,
  brand: {
    logo: "assets/images/logo_nobg.png",
    heroImage: "assets/images/logo_nobg.png",
  },
  sourceSamples: [
    {
      title: "Servers",
      type: "ModuleScript",
      image: "assets/images/apps/vscode.png",
      description: "Profile-safe item mutation with signals and compact validation.",
      code:
        "local InventoryService = {}\n\nfunction InventoryService:AddItem(player, itemId, amount)\n    local profile = self.Profiles[player]\n    if not profile or amount <= 0 then return false end\n\n    profile.Data.Inventory[itemId] = (profile.Data.Inventory[itemId] or 0) + amount\n    self.ItemAdded:Fire(player, itemId, amount)\n    return true\nend\n\nreturn InventoryService",
    },
    {
      title: "Ability Controller",
      type: "Client Controller",
      image: "",
      description: "Input-gated client logic with cooldown feedback and server validation.",
      code:
        "local AbilityController = {}\n\nfunction AbilityController:Cast(slot)\n    if self.Cooldowns:IsLocked(slot) then return end\n\n    self.Cooldowns:Lock(slot)\n    self.Remotes.CastAbility:FireServer(slot, self.Mouse.Hit.Position)\n    self.UI:PulseSlot(slot)\nend\n\nreturn AbilityController",
    },
  ],
  tools: [
    { name: "Visual Studio Code", icon: "assets/images/apps/vscode.png" },
    { name: "Blender", icon: "assets/images/apps/blender.png" },
    { name: "Git", icon: "assets/images/apps/git.png" },
    { name: "GitHub", icon: "assets/images/socials/github.png" },
    { name: "Rojo", icon: "assets/images/socials/rojo.png" },
    { name: "Roblox Studio", icon: "assets/images/apps/roblox_studio.png" },
  ],
  projects: [
    {
      title: "Eldforge",
      status: "Work In Progress",
      image: "assets/images/projects/eldforge.png",
      description: "An RPG game that will have a smooth combat system and provide to players a fun and engaging experience.",
      link: "https://www.roblox.com/games/102667004801396/Eldforge",
    },
    {
      title: "Coalition Battlegrounds",
      status: "Released",
      image: "assets/images/projects/coalition_battlegrounds.png",
      description: "A battlegrounds game where people use their favorite characters and fight. Inspired by Arena of Valor",
      link: "https://www.roblox.com/games/17624438086/Coalition-Battlegrounds",
    },
    {
      title: "Brainrot Showdown",
      status: "Closed",
      image: "assets/images/projects/brainrot_showdown.png",
      description: "A game I was worked on, this game has a smooth combat system and many fun mechanics.",
      link: "https://www.roblox.com/games/120101305497557/Brainrot-Showdown",
    },
  ],
  showcases: [
    {
      title: "Devlog #1",
      platform: "YouTube",
      description: "Battlegrounds game | Roblox",
      image: "assets/images/socials/youtube.png",
      url: "https://youtu.be/wAQ-BuoeXdU?si=k9X9CVU_zAcdh60W",
    },
    {
      title: "Devlog #2",
      platform: "YouTube",
      description: "Battlegrounds game devlog #2 | Roblox",
      image: "assets/images/socials/youtube.png",
      url: "https://youtu.be/nNE_JNC_g4A?si=4n5lE-7Jxpm5MDZO",
    },
  ],
  prices: [
    {
      name: "Combat Framework",
      price: "$59+",
      description: "A backend system provides smooth combat, and ensure the gameplay is fun and engaging.",
      features: ["Hitbox", "Ragdoll", "Stun", "Cooldown", "Knockback", "Projectile", "And More!"],
    },
    {
      name: "Quest System",
      price: "$16+",
      description: "Backend system provides the source easy to use and scale.",
      features: ["Server & Client Logic", "Complete Typing Support", "Easy To Use", "Scalable Modules"],
    },
    {
      name: "UI/UX Animations",
      price: "$10+",
      description: "Frontend animations that make the UI more alive and engaging.",
      features: ["Easy On The Eyes & Eye-catching", "Easy To Edit", "Delivery Fast!"],
    },
  ],
  reviews: [
    {
      name: "Tusdang",
      avatar: "T",
      avatarImage: "assets/images/clients/tusdang.png",
      rating: 5,
      description: "High-quality systems, especially when it comes to complex combat and RPG game. Sometimes play game alots, need my motivation to work well. Great backend system designer.",
    },
     {
      name: "Tusdang",
      avatar: "T",
      avatarImage: "assets/images/clients/tusdang.png",
      rating: 5,
      description: "High-quality systems, especially when it comes to complex combat and RPG game. Sometimes play game alots, need my motivation to work well. Great backend system designer.",
    },
     {
      name: "Tusdang",
      avatar: "T",
      avatarImage: "assets/images/clients/tusdang.png",
      rating: 5,
      description: "High-quality systems, especially when it comes to complex combat and RPG game. Sometimes play game alots, need my motivation to work well. Great backend system designer.",
    },
  ],
  contacts: [
    { label: "Roblox", url: "https://www.roblox.com/users/1158620607/profile", icon: "", iconImage: "assets/images/apps/roblox.png" },
    { label: "X", url: "https://x.com/pdv389", icon: "", iconImage: "assets/images/socials/x_black.png" },
    { label: "Gmail", url: "mailto:phongkorea389@example.com", icon: "", iconImage: "assets/images/socials/gmail.png" },
    { label: "GitHub", url: "https://github.com/phongEloper", icon: "", iconImage: "assets/images/socials/github.png" },
    { label: "Discord", url: "https://discord.com/users/917338746620358716", icon: "", iconImage: "assets/images/apps/discord.png" },
  ],
};
