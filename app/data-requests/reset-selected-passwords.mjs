import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "PASTE_YOUR_PROJECT_URL_HERE";
const SUPABASE_SERVICE_ROLE_KEY = "PASTE_YOUR_SERVICE_ROLE_KEY_HERE";

const PASSWORD = "123456";

const selectedEmails = [
  "nametseganggaanakobo@gmail.com",
  "matlhakukesegofetse@gmail.com",
  "loratokgaodi@gmail.com",
  "thatolebekwe@yahoo.com",
  "atangthololwane@gmail.com",
  "kgaudilaone506@gmail.com",
  "janetbafeletse@gmail.com",
  "sugartshephang@gmail.com",
  "galaletsangkangangwane@gmail.com",
  "jappieseo@gmail.com",
  "candicentee@gmail.com",
  "kaonegee007@gmail.com",
  "tumisangbadubi5@gmail.com",
  "kennadanayi7142@gmail.com",
  "laonekweteane@gmail.com",
  "gthipe61@gmail.com",
  "tuduetsodoreen@gmail.com",
  "cphuma8@gmail.com",
  "dollypraisenkganetsang@gmail.com",
  "wame8256@gmail.com",
  "ceciliatshimologo01@gmail.com",
  "kegombalume@gmail.com",
  "charityloratoseragi16@gmail.com",
  "mokgethe@gmail.com",
  "lety.ikhutseng@gmail.com",
  "mbatheraseanokeng@gmail.com",
  "batlang.chabanga@gmail.com",
  "bakanimisani@gmail.com",
  "kgolekelebogile91@gmail.com",
  "gaamangwemolema93@gmail.com",
  "hakimmaps55@gmail.com",
  "oshamokeatlaretse91@gmail.com",
  "busangmarriam@gmail.com",
  "bridgetkd123@gmail.com",
  "preciouskavezedi@gmail.com",
  "dipogisoanwen@gmail.com",
  "msbaikakedi@gmail.com",
  "sbongiletshwenyana@gmail.com",
  "jeffreylesea@gmail.com",
  "kaboyaonerosendana@gmail.com",
  "bagitsimakoko@gmail.com",
  "kaonekgomoekae@gmail.com",
  "anastaciakemoneilwe7@gmail.com",
  "oemekabelo@gmail.com",
  "laurenkeegatile@gmail.com",
  "molatlhegilone2@gmail.com",
  "gladokit8@gmail.com",
  "rramatatome@gmail.com",
  "lilykgeresi@gmail.com",
  "motlhankacn@gmail.com",
  "ggaerupi@gmail.com",
  "amantlebatshabang@gmail.com",
  "babedikentserametse@gmail.com",
  "kefinay@gmail.com",
  "katsolinon@gmail.com",
  "molemagaamangwe93@gmail.com",
  "chisetshegofatso@gmail.com",
  "kewagamangthobo26@gmail.com",
  "peloketeng@gmail.com",
  "mistergaolefufasadi@gmail.com",
  "maiketswanentebogang@gmail.com",
];

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function getAllUsers() {
  let page = 1;
  const perPage = 1000;
  let allUsers = [];

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    allUsers.push(...data.users);

    if (data.users.length < perPage) {
      break;
    }

    page++;
  }

  return allUsers;
}

async function run() {
  console.log("Loading users...");

  const users = await getAllUsers();

  for (const email of selectedEmails) {
    const user = users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      console.log(`❌ Not found: ${email}`);
      continue;
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: PASSWORD,
    });

    if (error) {
      console.log(`❌ Failed: ${email} - ${error.message}`);
    } else {
      console.log(`✅ Reset: ${email}`);
    }
  }

  console.log("");
  console.log("Finished.");
  console.log("Password set to: 123456");
}

run().catch(console.error);