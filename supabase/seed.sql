-- Storage bucket for recipe images
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- Storage policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'recipe images are publicly readable'
  ) then
    create policy "recipe images are publicly readable"
    on storage.objects for select
    using (bucket_id = 'recipe-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'users can upload own recipe images'
  ) then
    create policy "users can upload own recipe images"
    on storage.objects for insert
    with check (
      bucket_id = 'recipe-images'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'users can update own recipe images'
  ) then
    create policy "users can update own recipe images"
    on storage.objects for update
    using (bucket_id = 'recipe-images' and auth.uid()::text = (storage.foldername(name))[1])
    with check (bucket_id = 'recipe-images' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'users can delete own recipe images'
  ) then
    create policy "users can delete own recipe images"
    on storage.objects for delete
    using (bucket_id = 'recipe-images' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
end $$;
