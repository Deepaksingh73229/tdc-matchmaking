import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ClientService } from '@/lib/services/client.service';
import { MatchmakerService } from '@/lib/services/matchmaker.service';

const firstNames = ["Arjun", "Aditya", "Rohan", "Siddharth", "Vikram", "Karan", "Ishaan", "Varun", "Kabir", "Arav", "Vivaan", "Reyansh", "Aryan", "Atharv", "Krishna", "Ayush", "Shaurya", "Yash", "Rudra", "Om", "Dev", "Neil", "Ansh", "Kabir", "Aarav", "Advait", "Hrithik", "Ranbir", "Saif", "Shahid"];
const lastNames = ["Sharma", "Verma", "Patel", "Gupta", "Malhotra", "Iyer", "Nair", "Reddy", "Singh", "Khan", "Choudhury", "Joshi", "Aggarwal", "Mishra", "Dubey", "Pandey", "Saxena", "Kapoor", "Bhasin", "Trivedi", "Deshmukh", "Kulkarni", "Patil", "Rao", "Shetty"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow", "Chandigarh", "Gurgaon", "Noida"];
const religions = ["Hindu", "Muslim", "Sikh", "Christian", "Jain"];
const castes = ["Brahmin", "Kshatriya", "Vaishya", "Sunni", "Shia", "Jat", "Khatri", "Maratha", "Patel", "Lingayat"];
const colleges = ["IIT Bombay", "IIT Delhi", "IIT Madras", "IIM Bangalore", "BITS Pilani", "NIT Trichy", "SRM University", "Manipal Institute", "Delhi University", "NSIT", "DTU", "VIT Vellore"];
const companies = ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro", "Reliance Industries", "HDFC Bank", "ICICI Bank", "Zomato", "Swiggy", "Flipkart"];
const designations = ["Software Engineer", "Product Manager", "Data Scientist", "Marketing Manager", "Sales Lead", "Financial Analyst", "UX Designer", "Full Stack Developer", "Backend Lead"];
const hobbiesList = ["Reading tech blogs", "Mountain trekking", "Playing guitar", "Urban photography", "Gourmet cooking", "Competitive gaming", "Swimming", "Ashtanga Yoga", "Oil painting", "Playing Cricket"];

function getRandom(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function GET() {
    try {
        // 1. Clear existing data
        await Promise.all([
            MatchmakerService.deleteMany({}),
            ClientService.deleteMany({})
        ]);

        // 2. Create mock Matchmaker admin
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        await MatchmakerService.create({
            name: 'Admin Team',
            username: 'admin',
            passwordHash,
        });

        // 3. Generate 50 Male Clients
        const maleClients = [];
        for (let i = 0; i < 50; i++) {
            const firstName = getRandom(firstNames);
            const lastName = getRandom(lastNames);
            const religion = getRandom(religions);
            const city = getRandom(cities);
            
            maleClients.push({
                firstName,
                lastName,
                gender: 'Male',
                dob: getRandomDate(new Date('1985-01-01'), new Date('2002-12-31')),
                country: 'India',
                city,
                height_cm: Math.floor(Math.random() * (190 - 165 + 1)) + 165,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
                phone: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
                passwordHash, // reuse same hash for speed
                college: getRandom(colleges),
                degree: 'Bachelor of Technology',
                income_lpa: Math.floor(Math.random() * (60 - 6 + 1)) + 6,
                company: getRandom(companies),
                designation: getRandom(designations),
                maritalStatus: Math.random() > 0.9 ? 'Divorced' : 'Never Married',
                languages: ['English', getRandom(['Hindi', 'Marathi', 'Kannada', 'Tamil', 'Telugu', 'Gujarati'])],
                siblings: Math.floor(Math.random() * 3),
                caste: getRandom(castes),
                religion,
                wantKids: getRandom(['Yes', 'No', 'Maybe']),
                openToRelocate: getRandom(['Yes', 'No', 'Maybe']),
                openToPets: getRandom(['Yes', 'No', 'Maybe']),
                statusTag: 'On Hold',
                aboutMe: `I am a driven ${getRandom(designations)} who enjoys ${getRandom(hobbiesList)}. I value family and personal growth.`,
                hobbies: `${getRandom(hobbiesList)}, ${getRandom(hobbiesList)}, ${getRandom(hobbiesList)}`,
                partnerExpectations: `Looking for someone who is ${getRandom(['ambitious', 'kind-hearted', 'intelligent', 'family-oriented'])} and shares my love for ${getRandom(hobbiesList)}.`,
                preferences: {
                    preferredGender: 'Female',
                    minAge: 22,
                    maxAge: 35,
                    minHeight_cm: 150,
                    maxHeight_cm: 175,
                    minIncome_lpa: 0,
                    preferredReligions: [religion],
                    preferredCities: [city, getRandom(cities)],
                    preferredMaritalStatuses: ['Never Married'],
                    wantKids: 'Yes',
                    openToRelocate: 'Maybe'
                }
            });
        }

        // 4. Add a few females to make the app functional for testing matching
        const femaleNames = ["Priya", "Anjali", "Sana", "Meera", "Ishita", "Riya", "Kavya", "Deepika", "Shweta", "Nidhi"];
        for (let i = 0; i < 15; i++) {
            const firstName = getRandom(femaleNames);
            const lastName = getRandom(lastNames);
            const religion = getRandom(religions);
            const city = getRandom(cities);
            
            maleClients.push({
                firstName,
                lastName,
                gender: 'Female',
                dob: getRandomDate(new Date('1990-01-01'), new Date('2002-12-31')),
                country: 'India',
                city,
                height_cm: Math.floor(Math.random() * (175 - 150 + 1)) + 150,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 50}@example.com`,
                phone: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
                passwordHash,
                college: getRandom(colleges),
                degree: 'Bachelor of Arts',
                income_lpa: Math.floor(Math.random() * (40 - 5 + 1)) + 5,
                company: getRandom(companies),
                designation: 'Professional',
                maritalStatus: 'Never Married',
                languages: ['English', 'Hindi'],
                siblings: Math.floor(Math.random() * 3),
                caste: getRandom(castes),
                religion,
                wantKids: 'Yes',
                openToRelocate: 'Yes',
                openToPets: 'Yes',
                statusTag: 'On Hold',
                aboutMe: `Independent and happy person who loves life.`,
                hobbies: `Dancing, Reading, Cooking`,
                partnerExpectations: `Looking for a compatible partner.`,
                preferences: {
                    preferredGender: 'Male',
                    minAge: 25,
                    maxAge: 40,
                    minHeight_cm: 165,
                    maxHeight_cm: 190,
                    minIncome_lpa: 10,
                    preferredReligions: [religion],
                    preferredCities: [city],
                    preferredMaritalStatuses: ['Never Married'],
                    wantKids: 'Any',
                    openToRelocate: 'Any'
                }
            });
        }

        await ClientService.insertMany(maleClients as any);

        return NextResponse.json({ 
            message: 'Database re-seeded successfully!', 
            matchmaker: 'admin / password123',
            clientsAdded: maleClients.length
        }, { status: 200 });
    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: 'Failed to seed database: ' + error.message }, { status: 500 });
    }
}
