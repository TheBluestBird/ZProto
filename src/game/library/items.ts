import type { LibraryItem } from '@game/library/types';
import { assets } from './assets';

export const libraryItems: Record<string, LibraryItem> = {
  // River (Fishing) Items
  fishing_1: { id: 'fishing_1', name: 'Minnow', description: 'A tiny, shiny river fish.', icon: assets.fishing_1, price: 2 },
  fishing_2: { id: 'fishing_2', name: 'Carp', description: 'A sturdy and common pond fish.', icon: assets.fishing_2, price: 5 },
  fishing_3: { id: 'fishing_3', name: 'Trout', description: 'A speckled trout from clear mountain streams.', icon: assets.fishing_3, price: 10 },
  fishing_4: { id: 'fishing_4', name: 'Salmon', description: 'A rich, pink-fleshed fish that fights hard.', icon: assets.fishing_4, price: 20 },
  fishing_5: { id: 'fishing_5', name: 'Tuna', description: 'A powerful ocean predator, prized for its meat.', icon: assets.fishing_5, price: 40 },

  lumber_1: { id: 'lumber_1', name: 'Pine Log', description: 'Softwood log, easy to cut and shape.', icon: assets.lumber_1, price: 2 },
  lumber_2: { id: 'lumber_2', name: 'Birch Log', description: 'Light-colored log with papery bark.', icon: assets.lumber_2, price: 5 },
  lumber_3: { id: 'lumber_3', name: 'Oak Log', description: 'Dense, durable wood suitable for heavy construction.', icon: assets.lumber_3, price: 10 },
  lumber_4: { id: 'lumber_4', name: 'Maple Log', description: 'Strong wood with beautiful grain patterns.', icon: assets.lumber_4, price: 20 },
  lumber_5: { id: 'lumber_5', name: 'Yew Log', description: 'Rare, flexible wood perfect for precision crafting.', icon: assets.lumber_5, price: 40 },

  mining_1: { id: 'mining_1', name: 'Copper Ore', description: 'A soft, reddish-brown ore.', icon: assets.mining_1, price: 3 },
  mining_2: { id: 'mining_2', name: 'Tin Ore', description: 'A silvery-white metal ore used to make bronze.', icon: assets.mining_2, price: 7 },
  mining_3: { id: 'mining_3', name: 'Iron Ore', description: 'A heavy, dark ore rich in iron content.', icon: assets.mining_3, price: 15 },
  mining_4: { id: 'mining_4', name: 'Mithril Ore', description: 'A mythical, lightweight blue ore.', icon: assets.mining_4, price: 30 },
  mining_5: { id: 'mining_5', name: 'Adamantite Ore', description: 'An extremely dense and indestructible green ore.', icon: assets.mining_5, price: 60 },

  cooking_1: { id: 'cooking_1', name: 'Grilled Minnow', description: 'Lightly salted and grilled over an open fire.', icon: assets.cooking_1, price: 5 },
  cooking_2: { id: 'cooking_2', name: 'Carp Soup', description: 'A hearty broth cooked with herbs and carp.', icon: assets.cooking_2, price: 12 },
  cooking_3: { id: 'cooking_3', name: 'Pan-seared Trout', description: 'Crispy trout cooked with garlic butter.', icon: assets.cooking_3, price: 25 },
  cooking_4: { id: 'cooking_4', name: 'Smoked Salmon', description: 'Slow-smoked over maple wood for a rich flavor.', icon: assets.cooking_4, price: 50 },
  cooking_5: { id: 'cooking_5', name: 'Tuna Steak', description: 'Perfectly seared thick cut of fresh tuna.', icon: assets.cooking_5, price: 100 },

  carpentry_1: { id: 'carpentry_1', name: 'Pine Plank', description: 'A refined pine plank, ready for building.', icon: assets.carpentry_1, price: 5 },
  carpentry_2: { id: 'carpentry_2', name: 'Birch Stool', description: 'A simple, sturdy birch wood stool.', icon: assets.carpentry_2, price: 12 },
  carpentry_3: { id: 'carpentry_3', name: 'Oak Chest', description: 'A spacious storage chest reinforced with metal.', icon: assets.carpentry_3, price: 25 },
  carpentry_4: { id: 'carpentry_4', name: 'Maple Desk', description: 'An elegant writing desk with polished finish.', icon: assets.carpentry_4, price: 50 },
  carpentry_5: { id: 'carpentry_5', name: 'Yew Bow', description: 'A powerful bow crafted from seasoned yew wood.', icon: assets.carpentry_5, price: 100 },

  blacksmith_1: { id: 'blacksmith_1', name: 'Copper Ingot', description: 'A pure ingot of refined copper.', icon: assets.blacksmith_1, price: 6 },
  blacksmith_2: { id: 'blacksmith_2', name: 'Bronze Bar', description: 'An alloy of copper and tin.', icon: assets.blacksmith_2, price: 15 },
  blacksmith_3: { id: 'blacksmith_3', name: 'Iron Bar', description: 'A sturdy bar of smelted iron.', icon: assets.blacksmith_3, price: 30 },
  blacksmith_4: { id: 'blacksmith_4', name: 'Mithril Bar', description: 'A glowing, lightweight bar of mithril metal.', icon: assets.blacksmith_4, price: 60 },
  blacksmith_5: { id: 'blacksmith_5', name: 'Adamantite Bar', description: 'A heavy, incredibly tough bar of adamantite.', icon: assets.blacksmith_5, price: 120 },
};
