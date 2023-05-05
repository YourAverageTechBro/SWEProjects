# LinkTree Clone

This is a clone of the popular website Linktree, a link aggregator website that allows users to create a page with links
to their social media profiles. [Here](https://www.beacons.ai/youraveragetechbro) is an example of one.

[Here](https://youtu.be/rVRaV-qctm4) is a demo of what the app looks like.


## How To Run Locally

To run the game locally, run `npm install` to install all the necessary dependencies and then run `npm run dev` to run web appp.

This project uses [Supabase](https://supabase.com/) as the database. To set it up, create a `.env` file at the
root directory and include the following env variables.

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_project_anon_public_key
```

You can find the values for the two env variables in your Supabase project settings in the `API` tab.

Once you add your Supabase keys, you need to create the necessary tables in Supabase. 

You find the database schema in the [types/supabase.ts](https://www.sweprojects.com/projects/preview/clh7qgfw30000vr1re1505imehttps://github.com/YourAverageTechBro/SWEProjects/blob/main/projects/LinkTreeClone/types/supabase.ts) file.

## Want Step-By-Step Instructions?

If you want a step-by-step tutorial on how to build this project, you can find the tutorial on [here](https://www.sweprojects.com/projects/preview/clh7qgfw30000vr1re1505ime).

