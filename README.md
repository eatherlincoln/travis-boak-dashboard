# Sheldon Social Media Dashboard

## Project Info
**Production URL**: https://sheldon-social-media.vercel.app  
**Lovable Project**: https://lovable.dev/projects/bdf643ad-290d-438c-ba2c-38a826a4baec  
**Repo**: https://github.com/eatherlincoln/sheldon-social-media  

---

## How to Run Locally

```sh
# Step 1: Clone the repository
git clone https://github.com/eatherlincoln/sheldon-social-media.git

# Step 2: Navigate to the project directory
cd sheldon-social-media

# Step 3: Install dependencies
npm install

# Step 4: Start the dev server
npm run dev
➡️ After pasting that whole thing, hit **Enter**, then type `MARK` on a new line and hit Enter again.  
This saves the new README.md.

---

### 3. Create/overwrite the **SCHEMA.md**
Now copy this block:

```bash
cat > SCHEMA.md <<'MARK'
# Database Schema (Locked)

## Tables

### `top_posts`
| Column       | Type      | Constraints                          |
|--------------|----------|--------------------------------------|
| id           | uuid     | pk, default uuid_generate_v4()       |
| platform     | text     | not null                             |
| rank         | int      | not null                             |
| url          | text     | not null                             |
| caption      | text     | default ''                           |
| image_url    | text     | not null                             |
| likes        | int      | default 0                            |
| comments     | int      | default 0                            |
| shares       | int      | default 0                            |
| views        | int      | default 0                            |
| meta         | jsonb    | default '{}'::jsonb                  |
| updated_at   | timestamptz | default now()                     |

#### Indexes & Constraints
- `unique(platform, rank)` → ensures slot consistency  
- `unique(platform, url)` → prevents duplicates  

---

### `platform_stats`
| Column             | Type        |
|--------------------|-------------|
| id                 | uuid        |
| platform           | text        |
| follower_count     | int         |
| updated_at         | timestamptz |

---

### `audience`
| Column             | Type        |
|--------------------|-------------|
| id                 | uuid        |
| platform           | text        |
| label              | text        |
| percentage         | numeric     |
| updated_at         | timestamptz |

---

## Storage
- **Bucket:** `thumbnails`
- Policy: authenticated users can upload  
- Public read allowed  

---

## RLS Policies
### `top_posts`
- `select`: `true` (all can read)  
- `insert/update/delete`: only authenticated  

### `platform_stats`
- `select`: `true`  
- `insert/update`: only authenticated  

### `audience`
- `select`: `true`  
- `insert/update/delete`: only authenticated  

---

## Dedupe Playbook
- Posts must always be saved with `(platform, rank)`  
- IG/TikTok = 4 slots, YT = 2 slots  
- URLs must be unique per platform  
- Re-upload replaces old post in same slot  
