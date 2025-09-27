import { supabase } from "@supabaseClient";

export async function uploadThumbnail(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("thumbnails")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage.from("thumbnails").getPublicUrl(fileName);
  return data.publicUrl;
}
