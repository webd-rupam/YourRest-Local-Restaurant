import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { amount } = await req.json(); // Get amount from the request body

    if (!amount) {
      return new Response(
        JSON.stringify({ error: "Amount is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount, // Amount in paisa (e.g., 50000 = 500 INR)
      currency: "INR",
      receipt: `receipt_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    return new Response(
      JSON.stringify({
        id: order.id,
        currency: order.currency,
        amount: order.amount,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in creating Razorpay order:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create payment order" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
