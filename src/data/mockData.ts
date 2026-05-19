import type { FitmentRule } from '../domain/fitment/fitmentRule';

export interface Vehicle {
  make: string;
  models: {
    name: string;
    years: number[];
    engines: string[];
  }[];
}

export const vehicles: Vehicle[] = [
  {
    make: 'Toyota',
    models: [
      { name: 'Hilux', years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023], engines: ['2.4 GD-6', '2.8 GD-6', '2.7 VVTi', '4.0 V6'] },
      { name: 'Corolla', years: [2014, 2015, 2016, 2017, 2018, 2019, 2020], engines: ['1.3', '1.4 D-4D', '1.6', '1.8'] },
      { name: 'Fortuner', years: [2016, 2017, 2018, 2019, 2020, 2021], engines: ['2.4 GD-6', '2.8 GD-6', '2.7 VVTi', '4.0 V6'] },
    ],
  },
  {
    make: 'Ford',
    models: [
      { name: 'Ranger', years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022], engines: ['2.2 TDCi', '3.2 TDCi', '2.0 SiT', '2.0 BiT'] },
      { name: 'EcoSport', years: [2014, 2015, 2016, 2017, 2018, 2019], engines: ['1.0 EcoBoost', '1.5 Ti-VCT', '1.5 TDCi'] },
    ],
  },
  {
    make: 'Volkswagen',
    models: [
      { name: 'Polo', years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021], engines: ['1.4', '1.6', '1.2 TSI', '1.0 TSI', '1.9 TDI', '1.6 TDI'] },
      { name: 'Golf', years: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020], engines: ['1.4 TSI', '2.0 TSI (GTI)', '2.0 TSI (R)', '2.0 TDI'] },
      { name: 'Amarok', years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022], engines: ['2.0 TDI', '2.0 BiTDI', '3.0 V6 TDI'] },
    ],
  },
];

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
  price: number;
  stock: 'in_stock' | 'low_stock' | 'out_of_stock';
  fits: { make: string; model: string; year: number }[];
  fitmentRules?: FitmentRule[];
  description: string;
  image: string;
}

export const categories = [
  { id: 'brakes', name: 'Brake Pads & Discs', icon: 'Disc' },
  { id: 'filters', name: 'Filters (Oil, Air, Cabin)', icon: 'Filter' },
  { id: 'spark-plugs', name: 'Spark Plugs', icon: 'Zap' },
  { id: 'batteries', name: 'Batteries', icon: 'Battery' },
  { id: 'wipers', name: 'Wiper Blades', icon: 'CloudRain' },
  { id: 'oil', name: 'Oils & Lubricants', icon: 'Droplets' },
  { id: 'belts', name: 'Belts & Tensioners', icon: 'CircleDashed' },
  { id: 'shocks', name: 'Shocks & Suspension', icon: 'Activity' },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Ferodo Premium Brake Pads Front',
    brand: 'Ferodo',
    category: 'brakes',
    sku: 'FDB1234',
    price: 650.00,
    stock: 'in_stock',
    fits: [
      { make: 'Toyota', model: 'Hilux', year: 2016 },
      { make: 'Toyota', model: 'Hilux', year: 2017 },
      { make: 'Toyota', model: 'Hilux', year: 2018 },
    ],
    fitmentRules: [
      {
        id: 'p1-hilux-2016-2018-gd6',
        make: 'Toyota',
        model: 'Hilux',
        yearFrom: 2016,
        yearTo: 2018,
        engineNames: ['2.4 GD-6', '2.8 GD-6'],
        requiresManualConfirmation: ['front caliper type', 'disc diameter'],
        notes: ['Front axle brake pad set.'],
      },
    ],
    description: 'High-performance ceramic brake pads for long-lasting stopping power and reduced dust.',
    image: 'https://images.unsplash.com/photo-1600705030225-829d89163f58?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p2',
    name: 'Bosch Aerotwin Wiper Blades 24/16',
    brand: 'Bosch',
    category: 'wipers',
    sku: 'AR604S',
    price: 320.00,
    stock: 'in_stock',
    fits: [
      { make: 'Volkswagen', model: 'Polo', year: 2018 },
      { make: 'Volkswagen', model: 'Polo', year: 2019 },
      { make: 'Volkswagen', model: 'Golf', year: 2017 },
    ],
    fitmentRules: [
      { id: 'p2-polo-2018-2019', make: 'Volkswagen', model: 'Polo', yearFrom: 2018, yearTo: 2019, notes: ['Blade size 24/16. Confirm arm connector before dispatch.'], requiresManualConfirmation: ['wiper arm connector'] },
      { id: 'p2-golf-2017', make: 'Volkswagen', model: 'Golf', yearFrom: 2017, yearTo: 2017, notes: ['Blade size 24/16. Confirm arm connector before dispatch.'], requiresManualConfirmation: ['wiper arm connector'] },
    ],
    description: 'Flat wiper blade set with custom Evodium spring strip for a perfect wiping performance.',
    image: 'https://images.unsplash.com/photo-1542323326-78e723cc8f5a?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p3',
    name: 'NGK Iridium IX Spark Plug',
    brand: 'NGK',
    category: 'spark-plugs',
    sku: 'BKR6EIX',
    price: 180.00,
    stock: 'low_stock',
    fits: [
      { make: 'Ford', model: 'Ranger', year: 2015 },
      { make: 'Toyota', model: 'Corolla', year: 2016 },
    ],
    fitmentRules: [
      { id: 'p3-corolla-1-6-2014-2020', make: 'Toyota', model: 'Corolla', yearFrom: 2014, yearTo: 2020, engineNames: ['1.6', '1.8'], fuelTypes: ['petrol'] },
      { id: 'p3-ranger-petrol-2015', make: 'Ford', model: 'Ranger', yearFrom: 2015, yearTo: 2015, engineNames: ['2.5 petrol'], fuelTypes: ['petrol'] },
    ],
    description: 'Ultimate performance plug for extreme ignitability, improved throttle response and superior anti fouling.',
    image: 'https://images.unsplash.com/photo-1616782299868-b7fbcee95655?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p4',
    name: 'Castrol Magnatec 10W-40 5L',
    brand: 'Castrol',
    category: 'oil',
    sku: 'CAS-MAG-1040',
    price: 450.00,
    stock: 'in_stock',
    fits: [],
    fitmentRules: [
      { id: 'p4-universal-oil', universal: true, requiresManualConfirmation: ['oil grade required by service book', 'engine condition and mileage'], notes: ['Universal lubricant item. Not all engines use 10W-40.'] },
    ],
    description: 'Intelligent molecules that cling to engine parts to protect from the moment you turn the key.',
    image: 'https://images.unsplash.com/photo-1620050853580-c1157af7926b?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p5',
    name: 'GUD Oil Filter',
    brand: 'GUD',
    category: 'filters',
    sku: 'Z156',
    price: 110.00,
    stock: 'in_stock',
    fits: [
      { make: 'Toyota', model: 'Hilux', year: 2018 },
      { make: 'Toyota', model: 'Fortuner', year: 2018 },
    ],
    fitmentRules: [
      { id: 'p5-hilux-fortuner-gd6', make: 'Toyota', model: 'Hilux', yearFrom: 2016, yearTo: 2020, engineNames: ['2.4 GD-6', '2.8 GD-6'], notes: ['Common GD-6 service oil filter mapping.'] },
      { id: 'p5-fortuner-gd6', make: 'Toyota', model: 'Fortuner', yearFrom: 2016, yearTo: 2020, engineNames: ['2.4 GD-6', '2.8 GD-6'], notes: ['Common GD-6 service oil filter mapping.'] },
    ],
    description: 'Premium protection against engine wear, filtering out harmful contaminants.',
    image: 'https://images.unsplash.com/photo-1610486034139-4b62db489e5a?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p6',
    name: 'Willard Battery 652',
    brand: 'Willard',
    category: 'batteries',
    sku: 'WIL-652',
    price: 1650.00,
    stock: 'in_stock',
    fits: [
      { make: 'Ford', model: 'Ranger', year: 2018 },
      { make: 'Volkswagen', model: 'Amarok', year: 2018 },
    ],
    fitmentRules: [
      { id: 'p6-ranger-2016-2022', make: 'Ford', model: 'Ranger', yearFrom: 2016, yearTo: 2022, engineNames: ['2.2 TDCi', '3.2 TDCi', '2.0 SiT', '2.0 BiT'], requiresManualConfirmation: ['battery case size', 'terminal orientation', 'start-stop requirement'] },
      { id: 'p6-amarok-2016-2022', make: 'Volkswagen', model: 'Amarok', yearFrom: 2016, yearTo: 2022, engineNames: ['2.0 TDI', '2.0 BiTDI', '3.0 V6 TDI'], requiresManualConfirmation: ['battery case size', 'terminal orientation', 'start-stop requirement'] },
    ],
    description: 'Reliable starting power with an extended warranty for harsh conditions.',
    image: 'https://images.unsplash.com/photo-1596701659972-747353f86e33?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p7',
    name: 'GUD Cabin Air Filter',
    brand: 'GUD',
    category: 'filters',
    sku: 'AC-109',
    price: 145.00,
    stock: 'in_stock',
    fits: [
      { make: 'Volkswagen', model: 'Golf', year: 2015 },
      { make: 'Volkswagen', model: 'Polo', year: 2016 },
    ],
    fitmentRules: [
      { id: 'p7-golf-polo-cabin', make: 'Volkswagen', model: 'Golf', yearFrom: 2013, yearTo: 2018, notes: ['Cabin filter location and size must be checked on some variants.'], requiresManualConfirmation: ['facelift/variant'] },
      { id: 'p7-polo-cabin', make: 'Volkswagen', model: 'Polo', yearFrom: 2014, yearTo: 2017, notes: ['Cabin filter location and size must be checked on some variants.'], requiresManualConfirmation: ['facelift/variant'] },
    ],
    description: 'Breathe cleaner air inside your vehicle. Filters out dust, pollen, and exhaust fumes.',
    image: 'https://images.unsplash.com/photo-1635334752115-4673646540b0?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p8',
    name: 'Monroe Original Shock Absorber Rear',
    brand: 'Monroe',
    category: 'shocks',
    sku: 'MN-43112',
    price: 890.00,
    stock: 'low_stock',
    fits: [
      { make: 'Toyota', model: 'Corolla', year: 2019 },
    ],
    fitmentRules: [
      { id: 'p8-corolla-2018-2020-rear', make: 'Toyota', model: 'Corolla', yearFrom: 2018, yearTo: 2020, requiresManualConfirmation: ['sedan/hatch body', 'left/right side if applicable'], notes: ['Rear shock absorber fitment.'] },
    ],
    description: 'Restores handling and control to original factory specifications.',
    image: 'https://images.unsplash.com/photo-1591557303036-7c0827170a49?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p9',
    name: 'Shell Helix Ultra 5W-40 5L',
    brand: 'Shell',
    category: 'oil',
    sku: 'SHL-HXU-5W40',
    price: 520.00,
    stock: 'out_of_stock',
    fits: [],
    fitmentRules: [
      { id: 'p9-universal-oil', universal: true, requiresManualConfirmation: ['oil grade required by service book', 'engine condition and mileage'], notes: ['Universal lubricant item. Not all engines use 5W-40.'] },
    ],
    description: 'Fully synthetic motor oil tailored to meet the exacting requirements of high-performance engines.',
    image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p10',
    name: 'Gates Timing Belt Kit',
    brand: 'Gates',
    category: 'belts',
    sku: 'GB-K015565XS',
    price: 1250.00,
    stock: 'in_stock',
    fits: [
      { make: 'Ford', model: 'EcoSport', year: 2015 },
    ],
    fitmentRules: [
      { id: 'p10-ecosport-tdci', make: 'Ford', model: 'EcoSport', yearFrom: 2014, yearTo: 2017, engineNames: ['1.5 TDCi'], requiresManualConfirmation: ['engine code', 'timing belt kit contents'] },
    ],
    description: 'Complete timing belt replacement kit including tensioners and pulleys for accurate synchronization.',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p11',
    name: 'ATE Brake Discs Vented Front',
    brand: 'ATE',
    category: 'brakes',
    sku: 'ATE-24.0122-0193.1',
    price: 1100.00,
    stock: 'in_stock',
    fits: [
      { make: 'Volkswagen', model: 'Golf', year: 2018 },
      { make: 'Volkswagen', model: 'Polo', year: 2019 },
    ],
    fitmentRules: [
      { id: 'p11-golf-2017-2020-front-disc', make: 'Volkswagen', model: 'Golf', yearFrom: 2017, yearTo: 2020, requiresManualConfirmation: ['disc diameter', 'PR brake code'], notes: ['Front vented brake disc.'] },
      { id: 'p11-polo-2018-2020-front-disc', make: 'Volkswagen', model: 'Polo', yearFrom: 2018, yearTo: 2020, requiresManualConfirmation: ['disc diameter', 'PR brake code'], notes: ['Front vented brake disc.'] },
    ],
    description: 'High-carbon brake discs for superior braking performance and reduced noise.',
    image: 'https://images.unsplash.com/photo-1486262715619-679df11f6c44?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p12',
    name: 'Fram Fuel Filter',
    brand: 'Fram',
    category: 'filters',
    sku: 'G10230',
    price: 210.00,
    stock: 'low_stock',
    fits: [
      { make: 'Toyota', model: 'Hilux', year: 2020 },
      { make: 'Toyota', model: 'Fortuner', year: 2020 },
    ],
    fitmentRules: [
      { id: 'p12-hilux-gd6-fuel', make: 'Toyota', model: 'Hilux', yearFrom: 2016, yearTo: 2021, engineNames: ['2.4 GD-6', '2.8 GD-6'], fuelTypes: ['diesel'], notes: ['Diesel fuel filter mapping.'] },
      { id: 'p12-fortuner-gd6-fuel', make: 'Toyota', model: 'Fortuner', yearFrom: 2016, yearTo: 2021, engineNames: ['2.4 GD-6', '2.8 GD-6'], fuelTypes: ['diesel'], notes: ['Diesel fuel filter mapping.'] },
    ],
    description: 'Traps dirt, rust, and other contaminants to ensure smooth fuel flow and engine performance.',
    image: 'https://images.unsplash.com/photo-1629828456250-9bbdd97a760c?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p13',
    name: 'Delkor Calcium Battery 646',
    brand: 'Delkor',
    category: 'batteries',
    sku: 'DEL-646',
    price: 1450.00,
    stock: 'in_stock',
    fits: [
      { make: 'Toyota', model: 'Corolla', year: 2015 },
    ],
    fitmentRules: [
      { id: 'p13-corolla-battery', make: 'Toyota', model: 'Corolla', yearFrom: 2014, yearTo: 2020, requiresManualConfirmation: ['battery case size', 'terminal orientation'] },
    ],
    description: 'Maintenance-free calcium battery offering long life and reliable cold cranking amps.',
    image: 'https://images.unsplash.com/photo-1617596843477-8025e1bb344b?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: 'p14',
    name: 'Dayco Multi-Rib Poly-V Belt',
    brand: 'Dayco',
    category: 'belts',
    sku: 'DY-6PK1890',
    price: 280.00,
    stock: 'in_stock',
    fits: [
      { make: 'Ford', model: 'Ranger', year: 2014 },
    ],
    fitmentRules: [
      { id: 'p14-ranger-tdci-belt', make: 'Ford', model: 'Ranger', yearFrom: 2012, yearTo: 2016, engineNames: ['2.2 TDCi', '3.2 TDCi'], requiresManualConfirmation: ['belt length', 'with/without aircon layout'] },
    ],
    description: 'Engineered for high mileage, demanding drives and quiet, dependable performance.',
    image: 'https://images.unsplash.com/photo-1601056637375-7b5f543df30d?auto=format&fit=crop&q=80&w=400&h=300',
  }
];