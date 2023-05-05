# FlappyBirdClone

This is a clone of the popular game Flappy Bird. This game is made using NextJS and Supabase.

[Here](https://youtu.be/OqO05TfRE3A) is a demo of what the app looks like.


## How To Run Locally

To run the game locally, run `npm install` to install all the necessary dependencies and then run `npm run dev` to run web appp.

This iteration of Flappy bird stores the score of the user's game in a database. 
This project uses [Supabase](https://supabase.com/) as the database. To set it up, create a `.env` file at the 
root directory and include the following env variables.

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_project_anon_public_key
```

You can find the values for the two env variables in your Supabase project settings in the `API` tab.

Once you add your Supabase keys, you need to create the actual `scores` table in your Supabase project with the following schema:


```
table scores {
    id: string
    created_at: string;
    score: number;
}
```

## Want Step-By-Step Instructions?

If you want a step-by-step tutorial on how to build this project, you can find the tutorial on [here](https://www.sweprojects.com/projects/preview/clgk8x5w1000cvrvb86b13ut7).

