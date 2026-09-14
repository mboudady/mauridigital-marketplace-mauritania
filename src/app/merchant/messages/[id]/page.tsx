import { ConversationThread } from "@/components/ConversationThread";

export default async function MerchantMessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConversationThread conversationId={id} backHref="/merchant/messages" />;
}
