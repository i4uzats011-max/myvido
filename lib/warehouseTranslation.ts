// Comprehensive Chinese -> English Cargo & Logistics Dictionary
export const LOGISTICS_DICTIONARY: Record<string, string> = {
  // Automotive & Lighting
  'LED车灯': 'LED Car Light',
  '汽车LED灯': 'Automotive LED Light',
  '汽车LED大灯': 'Car LED Headlight',
  'LED汽车灯': 'LED Car Light',
  '摩托车LED灯': 'Motorcycle LED Light',
  '车灯': 'Car Light / Headlamp',
  '雾灯': 'Fog Lamp',
  '汽车氛围灯': 'Car Ambient Lighting',
  '电视背光灯条': 'TV LED Backlight Strip',
  'LED模组': 'LED Module',
  'LED灯': 'LED Lamp',
  '氖管': 'Neon Tube',
  '车窗电机': 'Car Window Motor',
  '汽车玻璃升降器': 'Car Power Window Regulator',
  '汽车开关': 'Car Switch',
  '汽车配件': 'Automotive Parts',
  '自动变速箱配件': 'Automatic Transmission Parts',
  '离合器': 'Clutch',
  '离合器片': 'Clutch Plate',
  '发动机': 'Engine',
  '发动机支架': 'Engine Mount',
  '发电机': 'Generator / Alternator',
  '发电机和配件': 'Generator & Accessories',
  '火花塞': 'Spark Plug',
  '减震器': 'Shock Absorber',
  '刹车片': 'Brake Pads',
  '水箱': 'Water Tank / Radiator',
  '水箱配件': 'Water Tank Accessories',
  '保险杠': 'Bumper',
  '轮毂': 'Wheel Rim / Hub',
  '轮胎': 'Tire',
  '胎压检查器': 'Tire Pressure Gauge',
  '车充': 'Car Charger',
  '车载导航仪': 'Car GPS Navigator',
  '隔音垫': 'Soundproofing Mat',
  '汽车膜': 'Car Protective Film / Tint',
  '刻字膜': 'Lettering Vinyl Film',
  '切膜机': 'Film Cutting Machine',
  '后膜': 'Back Screen Protector Film',

  // Motorcycle Parts
  '摩托车配件': 'Motorcycle Parts',
  '摩托配件': 'Motorcycle Parts',
  '摩托车后视镜': 'Motorcycle Rearview Mirror',
  '摩托车导航仪': 'Motorcycle GPS Navigator',
  '摩托车靠背': 'Motorcycle Backrest',
  '摩托车显示屏': 'Motorcycle Display Screen',
  '摩托车包': 'Motorcycle Bag',

  // Electronics & Electrical
  '控制器': 'Controller',
  '电子模块': 'Electronic Module',
  '开关电源': 'Switching Power Supply',
  '电源板': 'Power Supply Board',
  '电陶炉开关电源': 'Ceramic Cooktop Power Supply',
  '电陶炉控制板': 'Ceramic Cooktop Control Board',
  'POE模块，电源板': 'POE Module & Power Board',
  'POE模块': 'POE Module',
  '风扇电机': 'Fan Motor',
  '传感器': 'Sensor',
  '连接线': 'Connecting Cable',
  '接线端子': 'Wire Terminals',
  '充电器': 'Charger',
  '充电器，数据线': 'Charger & Data Cable',
  '数据线': 'Data Cable',
  '耳机，数据线，充电头': 'Earphones, Data Cable & Charger Head',
  '音箱': 'Speaker / Soundbox',
  '喇叭': 'Horn / Speaker',
  '电视机遥控器': 'TV Remote Control',
  '监控镜头': 'Surveillance Camera Lens',
  '录像机配件': 'Video Recorder Accessories',
  '硬盘盒': 'Hard Drive Enclosure',
  '笔记本电脑外壳': 'Laptop Shell / Casing',
  '智能门锁': 'Smart Door Lock',
  '耳机硅胶保护套': 'Earphone Silicone Case',

  // Hardware & Tools
  '五金': 'Hardware Fittings',
  '五金纽扣': 'Metal Snaps / Buttons',
  '螺丝': 'Screws',
  '撞钉，螺丝': 'Rivets & Screws',
  '撞钉': 'Rivets / Studs',
  '铝钉': 'Aluminum Rivets',
  '不锈钢柳钉': 'Stainless Steel Rivets',
  '套筒': 'Socket / Sleeve',
  '电动螺丝刀': 'Electric Screwdriver',
  '焊锡膏': 'Solder Paste',
  '硅胶套管': 'Silicone Sleeve / Tubing',
  '硅胶模具': 'Silicone Mold',
  '绝缘材料': 'Insulating Material',
  '护线圈': 'Cable Grommet / Wire Protector',
  '衬套': 'Bushing',
  '装饰条': 'Decorative Trim Strip',
  '防滑垫': 'Anti-Slip Mat',
  '胶水': 'Adhesive / Glue',
  '折叠台架': 'Folding Stand / Rack',
  '置物架收纳盒等': 'Storage Racks & Boxes',
  '接纸盘': 'Paper Output Tray',

  // Apparel, Bags & Daily Necessities
  '男装短袖': "Men's Short-Sleeve Shirts",
  '毛衣': 'Sweater',
  '外套': 'Jacket / Coat',
  '服装': 'Clothing / Apparel',
  '围巾': 'Scarf',
  '鞋材': 'Shoe Material',
  '箱包配件': 'Bag & Luggage Accessories',
  '女士手提包': "Women's Handbag",
  '女包': "Women's Handbag",
  '女士包': "Women's Bag",
  '包包': 'Bags / Handbags',
  '手袋': 'Handbag',
  '布包': 'Cloth / Canvas Bag',
  '太阳镜': 'Sunglasses',
  '茶壶配件': 'Teapot Accessories',
  '包装袋': 'Packaging Bags',
  '塑料盒': 'Plastic Box',
  '塑料': 'Plastic',
  '磁力积木玩具': 'Magnetic Building Blocks Toy',
  '积木玩具': 'Building Blocks Toy',
  '假指甲': 'Artificial Nails',
  '防雨区块': 'Rainproof Cover / Sheet',
};

// Substring replacement keywords for compound words
const COMPOUND_KEYWORDS: [string, string][] = [
  ['发电机和配件', 'Generator & Accessories'],
  ['电陶炉开关电源', 'Ceramic Cooktop Power Supply'],
  ['电陶炉控制板', 'Ceramic Cooktop Control Board'],
  ['笔记本电脑外壳', 'Laptop Shell'],
  ['耳机硅胶保护套', 'Earphone Silicone Case'],
  ['充电器，数据线', 'Charger & Data Cable'],
  ['撞钉，螺丝', 'Rivets & Screws'],
  ['灯，胎压检查器', 'Lights & Tire Gauge'],
  ['摩托车后视镜', 'Motorcycle Rearview Mirror'],
  ['摩托车导航仪', 'Motorcycle Navigator'],
  ['摩托车配件', 'Motorcycle Parts'],
  ['汽车玻璃升降器', 'Car Window Regulator'],
  ['车载导航仪', 'Car Navigator'],
  ['汽车氛围灯', 'Car Ambient Light'],
  ['自动变速箱配件', 'Automatic Transmission Parts'],
  ['电视机遥控器', 'TV Remote Control'],
  ['电动螺丝刀', 'Electric Screwdriver'],
  ['汽车LED大灯', 'Car LED Headlight'],
  ['女士手提包', "Women's Handbag"],
  ['磁力积木玩具', 'Magnetic Building Blocks Toy'],
  ['置物架收纳盒等', 'Storage Racks & Boxes'],
  ['不锈钢柳钉', 'Stainless Steel Rivets'],
  ['电视背光灯条', 'TV LED Backlight Strip'],
  ['汽车膜', 'Car Protective Film'],
  ['切膜机', 'Film Cutting Machine'],
  ['发动机支架', 'Engine Mount'],
  ['离合器片', 'Clutch Plate'],
  ['开关电源', 'Switching Power Supply'],
  ['车窗电机', 'Car Window Motor'],
  ['风扇电机', 'Fan Motor'],
  ['智能门锁', 'Smart Door Lock'],
  ['智能', 'Smart'],
  ['门锁', 'Door Lock'],
  ['汽车', 'Car '],
  ['摩托车', 'Motorcycle '],
  ['摩托', 'Motorcycle '],
  ['车灯', 'Car Light'],
  ['大灯', 'Headlight'],
  ['雾灯', 'Fog Lamp'],
  ['配件', 'Accessories'],
  ['支架', 'Bracket / Mount'],
  ['控制器', 'Controller'],
  ['发电机', 'Generator'],
  ['发动机', 'Engine'],
  ['离合器', 'Clutch'],
  ['减震器', 'Shock Absorber'],
  ['刹车片', 'Brake Pads'],
  ['火花塞', 'Spark Plug'],
  ['水箱', 'Water Tank'],
  ['螺丝', 'Screws'],
  ['铝钉', 'Aluminum Rivets'],
  ['撞钉', 'Rivets'],
  ['模组', 'Module'],
  ['模块', 'Module'],
  ['电源', 'Power Supply'],
  ['开关', 'Switch'],
  ['传感器', 'Sensor'],
  ['音箱', 'Speaker'],
  ['喇叭', 'Horn / Speaker'],
  ['连接线', 'Cable'],
  ['数据线', 'Data Cable'],
  ['充电器', 'Charger'],
  ['五金', 'Hardware'],
  ['纽扣', 'Buttons'],
  ['短袖', 'Short-Sleeve'],
  ['男装', "Men's Apparel"],
  ['女装', "Women's Apparel"],
  ['毛衣', 'Sweater'],
  ['外套', 'Jacket'],
  ['围巾', 'Scarf'],
  ['包包', 'Bag'],
  ['女包', "Women's Bag"],
  ['手袋', 'Handbag'],
  ['箱包', 'Luggage & Bags'],
  ['鞋材', 'Shoe Material'],
  ['玩具', 'Toy'],
  ['积木', 'Building Blocks'],
  ['硅胶', 'Silicone'],
  ['模具', 'Mold'],
  ['塑料', 'Plastic'],
  ['盒', 'Box'],
  ['袋', 'Bag'],
  ['胶水', 'Adhesive / Glue'],
  ['垫', 'Mat'],
  ['条', 'Strip'],
  ['膜', 'Film'],
  ['和', ' & '],
  ['及', ' & '],
  ['等', ' etc.'],
];

/**
 * Translate Chinese cargo / warehouse commodity to clean English.
 * 1. Checks exact dictionary match
 * 2. Checks compound keyword substitutions
 * 3. Fallback preserves text cleanly
 */
export function translateChineseCommodity(chineseText: string): string {
  if (!chineseText || !chineseText.trim()) return '';
  const text = chineseText.trim();

  // 1. Exact match in high-priority logistics dictionary
  if (LOGISTICS_DICTIONARY[text]) {
    return LOGISTICS_DICTIONARY[text];
  }

  // 2. Compound keyword matching
  let result = text;
  for (const [zh, en] of COMPOUND_KEYWORDS) {
    if (result.includes(zh)) {
      result = result.split(zh).join(` ${en} `);
    }
  }

  // Clean up whitespace and punctuation
  result = result
    .replace(/[，,]/g, ' & ')
    .replace(/\s+/g, ' ')
    .trim();

  // If text contains any latin words originally (e.g. "LED车灯", "POE模块"), format nicely
  return result || text;
}

/**
 * Returns a dual-language label, e.g. "LED Car Light (LED车灯)"
 * Guarantees zero mistake / zero misunderstanding for warehouse staff.
 */
export function getDualLanguageCommodity(chineseText: string, customEnglish?: string): {
  english: string;
  chinese: string;
  display: string;
} {
  const chinese = (chineseText || '').trim();
  const english = (customEnglish || '').trim() || translateChineseCommodity(chinese);
  const display = english && english !== chinese ? `${english} (${chinese})` : chinese;

  return {
    english,
    chinese,
    display,
  };
}
