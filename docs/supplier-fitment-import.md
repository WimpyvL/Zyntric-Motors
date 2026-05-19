# Supplier fitment import

Phase 3 allows supplier CSV rows to carry fitment metadata. The admin import still accepts the existing product fields, but it now also recognizes optional fitment columns and converts them into `fitmentRules`.

## Required product columns

```csv
sku,name,brand,category,price,stockQuantity
```

## Optional fitment columns

```csv
fitmentMake,fitmentModel,yearFrom,yearTo,engineNames,engineCodes,fuelTypes,bodyTypes,transmissionTypes,driveTypes,oeNumbers,universal,requiresManualConfirmation,fitmentNotes
```

## List formatting

For multi-value fields, separate values with pipes, commas, or semicolons.

```csv
engineNames
2.4 GD-6|2.8 GD-6
```

## Example

```csv
sku,name,brand,category,price,stockQuantity,fitmentMake,fitmentModel,yearFrom,yearTo,engineNames,fuelTypes,requiresManualConfirmation,fitmentNotes
GUD-Z156,GUD Oil Filter,GUD,filters,110,12,Toyota,Hilux,2016,2020,2.4 GD-6|2.8 GD-6,diesel,,Common GD-6 service oil filter mapping
FDB1234,Ferodo Premium Brake Pads Front,Ferodo,brakes,650,7,Toyota,Hilux,2016,2018,2.4 GD-6|2.8 GD-6,,front caliper type|disc diameter,Front axle brake pad set
CAS-MAG-1040,Castrol Magnatec 10W-40 5L,Castrol,oil,450,20,,,,,,,true,oil grade required by service book|engine condition and mileage,Universal lubricant item
```

## Import behavior

- Existing products are matched by `sku`.
- Imported stock and price update the existing product.
- Imported fitment metadata creates or replaces a matching fitment rule.
- Rows without fitment metadata still import as ordinary products.
- Universal/service items should set `universal=true` and include confirmation notes.

## Fitment warning

Supplier data should be treated as operational input, not final truth. Brake, battery, suspension, belt, and oil products often still need manual confirmation before fulfilment.
