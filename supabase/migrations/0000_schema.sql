-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: shops
create table public.shops (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references auth.users(id) on delete cascade not null,
    name_th text not null,
    name_en text,
    slug text unique not null,
    logo_url text,
    description_th text,
    description_en text,
    phone text,
    currency text default 'THB',
    opening_hours jsonb default '{"mon": {"open": "09:00", "close": "21:00"}, "tue": {"open": "09:00", "close": "21:00"}, "wed": {"open": "09:00", "close": "21:00"}, "thu": {"open": "09:00", "close": "21:00"}, "fri": {"open": "09:00", "close": "21:00"}, "sat": {"open": "09:00", "close": "21:00"}, "sun": {"open": "09:00", "close": "21:00"}}'::jsonb,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Table: categories
create table public.categories (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid references public.shops(id) on delete cascade not null,
    name_th text not null,
    name_en text,
    sort_order integer default 0,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- Table: menu_items
create table public.menu_items (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid references public.shops(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete set null,
    name_th text not null,
    name_en text,
    description_th text,
    description_en text,
    price decimal(10,2) not null,
    image_url text,
    status text default 'available' check (status in ('available', 'sold_out', 'hidden')),
    badges text[], -- array of: 'recommended', 'popular', 'new', 'spicy'
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
alter table public.shops enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;

-- Policies for shops
create policy "Anyone can select active shops"
    on public.shops for select
    using (is_active = true);

create policy "Shop owners can CRUD their own shops"
    on public.shops for all
    using (auth.uid() = owner_id)
    with check (auth.uid() = owner_id);

-- Policies for categories
create policy "Anyone can select active categories"
    on public.categories for select
    using (is_active = true);

create policy "Shop owners can CRUD their own categories"
    on public.categories for all
    using (
        shop_id in (select id from public.shops where owner_id = auth.uid())
    )
    with check (
        shop_id in (select id from public.shops where owner_id = auth.uid())
    );

-- Policies for menu_items
create policy "Anyone can select visible menu items"
    on public.menu_items for select
    using (status != 'hidden');

create policy "Shop owners can CRUD their own menu items"
    on public.menu_items for all
    using (
        shop_id in (select id from public.shops where owner_id = auth.uid())
    )
    with check (
        shop_id in (select id from public.shops where owner_id = auth.uid())
    );

-- Updated_at Trigger Function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at_shops
    before update on public.shops
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_menu_items
    before update on public.menu_items
    for each row execute procedure public.handle_updated_at();

-- Slug Generation Function for Shop
create or replace function public.generate_shop_slug()
returns trigger as $$
declare
    base_slug text;
    new_slug text;
    counter int := 1;
begin
    -- If slug is already provided, just proceed
    if new.slug is not null then
        return new;
    end if;

    -- Generate a base slug: use name_en if available, otherwise generate random short ID
    if new.name_en is not null and trim(new.name_en) != '' then
        base_slug := lower(regexp_replace(trim(new.name_en), '[^a-zA-Z0-9]+', '-', 'g'));
        -- remove trailing dashes
        base_slug := trim(both '-' from base_slug);
    else
        base_slug := substr(md5(random()::text), 1, 8);
    end if;
    
    if base_slug = '' then
        base_slug := substr(md5(random()::text), 1, 8);
    end if;

    new_slug := base_slug;
    
    -- Ensure uniqueness
    while exists (select 1 from public.shops where slug = new_slug and id != new.id) loop
        new_slug := base_slug || '-' || counter;
        counter := counter + 1;
    end loop;

    new.slug := new_slug;
    return new;
end;
$$ language plpgsql;

create trigger ensure_shop_slug
    before insert on public.shops
    for each row execute procedure public.generate_shop_slug();

-- Set up Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 5242880, '{"image/jpeg","image/png","image/webp"}')
on conflict (id) do update set 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = '{"image/jpeg","image/png","image/webp"}';

-- Storage Policies
create policy "Anyone can read menu images"
    on storage.objects for select
    using (bucket_id = 'menu-images');

create policy "Authenticated users can upload menu images"
    on storage.objects for insert
    using (bucket_id = 'menu-images' and auth.role() = 'authenticated');

create policy "Authenticated users can update their menu images"
    on storage.objects for update
    using (bucket_id = 'menu-images' and auth.role() = 'authenticated');

create policy "Authenticated users can delete their menu images"
    on storage.objects for delete
    using (bucket_id = 'menu-images' and auth.role() = 'authenticated');

-- Function to Auto-create shop after user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.shops (owner_id, name_th, name_en)
    values (
        new.id, 
        coalesce(new.raw_user_meta_data->>'full_name', 'ร้านค้าใหม่ของฉัน'),
        coalesce(new.raw_user_meta_data->>'full_name', 'My New Shop')
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
