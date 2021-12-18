import { Connection } from "typeorm"
import faker from "faker"
import { LineItem, LineItemTaxLine } from "@medusajs/medusa"

type TaxLineFactoryData = {
  rate: number
  code: string
  name: string
}

export type LineItemFactoryData = {
  id?: string
  cart_id?: string
  order_id?: string
  variant_id: string | null
  title?: string
  description?: string
  thumbnail?: string
  should_merge?: boolean
  allow_discounts?: boolean
  unit_price?: number
  quantity?: number
  fulfilled_quantity?: boolean
  shipped_quantity?: boolean
  returned_quantity?: boolean
  tax_lines?: TaxLineFactoryData[]
}

export const simpleLineItemFactory = async (
  connection: Connection,
  data: LineItemFactoryData,
  seed?: number
): Promise<LineItem> => {
  if (
    typeof data.cart_id === "undefined" &&
    typeof data.order_id === "undefined"
  ) {
    throw Error()
  }

  if (typeof seed !== "undefined") {
    faker.seed(seed)
    Math
  }

  const manager = connection.manager

  const id = data.id || `simple-line-${Math.random() * 1000}`
  const toSave = manager.create(LineItem, {
    cart_id: data.cart_id,
    order_id: data.order_id,
    title: data.title || faker.commerce.productName(),
    description: data.description || "",
    thumbnail: data.thumbnail || "",
    should_merge:
      typeof data.should_merge !== "undefined" ? data.should_merge : true,
    allow_discounts:
      typeof data.allow_discounts !== "undefined" ? data.allow_discounts : true,
    unit_price: typeof data.unit_price !== "undefined" ? data.unit_price : 100,
    variant_id: data.variant_id,
    quantity: data.quantity || 1,
    fulfilled_quantity: data.fulfilled_quantity || null,
    shipped_quantity: data.shipped_quantity || null,
    returned_quantity: data.returned_quantity || null,
  })

  const line = await manager.save(toSave)

  if (typeof data.tax_lines !== "undefined") {
    for (const tl of data.tax_lines) {
      manager.insert(LineItemTaxLine, {
        item_id: id,
        rate: tl.rate,
        code: tl.code,
        name: tl.name,
      })
    }
  }

  return line
}