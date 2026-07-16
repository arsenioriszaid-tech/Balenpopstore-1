import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerAddress, totalAmount, items } = body;

    if (!customerName || !totalAmount || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing required checkout parameters." },
        { status: 400 }
      );
    }

    // Insert to sales
    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_address: customerAddress || null,
        status: "completed",
        total_amount: Number(totalAmount),
      });

    if (saleError) {
      console.error("Database failed on sale insert:", saleError);
      return NextResponse.json({ error: saleError.message }, { status: 500 });
    }

    // Capture the newly created sale ID
    const insertedSale = Array.isArray(saleData) && (saleData as any[]).length > 0 ? (saleData as any[])[0] : null;
    const saleId = insertedSale ? insertedSale.id : `sale-${Math.random().toString(36).substring(7)}`;

    // Prepare sale items list
    const preparedItems = items.map((item: any) => ({
      sale_id: saleId,
      product_id: item.productId,
      variant_id: item.variantId || null,
      quantity: Number(item.quantity || 1),
      price_at_sale: Number(item.priceAtSale),
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(preparedItems);

    if (itemsError) {
      console.error("Database failed on sale items insert:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, saleId });

  } catch (err: any) {
    console.error("Internal API Error on sales logging:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
