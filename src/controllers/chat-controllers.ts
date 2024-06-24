import { Request, Response, NextFunction } from "express";
import User from "../models/user-model.js";
import { ChatCompletionRequestMessage, OpenAIApi } from "openai";
import { LastMile } from "lastmileai";

const lastMile = new LastMile({apiKey: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..EJLW5IOVFffjKxTY.ABmw-vedhWBZrq9BRmU99Ywhlk3ZooPnO2ODotC5KN5PlMY2cI1MpH96rQZ9neOKU2biiHy2jkuOGuyikjZihJMtLCHEYqze8zxM2xT3XB4lqVBLhWdoHHsgUwsgAWp-qQ8w7WMjHgIA5YONEPzOkwk2anU1J7IxtqP21Ilfg5pNqshxBQp45wQTWbjVTia6y94TzNfB-hr5abS1tyQ5DLnPEH3FzQbImnoLEq-GV2WoG76G59k40cG1xmDZfv548fy94CUamopWmfy24QC53OfArsQGEHjJX1FtHiGRIOZkYKktNbHWaNESjPaBZ3dKli6NswX3QvuMWNkg71TIhfjklN7uX6aYrOzTS6Zqk70Sa-3L3LI08e8u5qx4yw.zMj2j6rohuqsFKP-aqlnAQ'});
console.log(lastMile)

export const generateChatCompletion = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { message } = req.body;

		const user = await User.findById(res.locals.jwtData.id);
		if (!user) {
			return res.status(401).json("User not registered / token malfunctioned");
		}

		// grab chats of users

		const chats = user.chats.map(({ role, content }) => ({
			role,
			content,
		})) as ChatCompletionRequestMessage[];
		chats.push({ content: message, role: "user" });

		// save chats inside real user object
		user.chats.push({ content: message, role: "user" });

		// make request to openAi
		// get latest response
		const chatResponse = await lastMile.createOpenAIChatCompletion({
			completionParams: {
			  model: "gpt-3.5-turbo",
			  messages: [
				{ role: "user", content: `imagine you are an SQL expert and you had this question ${message} what is the anwer?` },
			  ],
			},
		  });

		  console.log(chatResponse.choices[0].message?.content);

		// push latest response to db
		user.chats.push({ role: "assistant", content: chatResponse.choices[0].message?.content });
		await user.save();

		return res.status(200).json({ chats: user.chats });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: error.message });
	}
};

export const getAllChats = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findById(res.locals.jwtData.id); // get variable stored in previous middleware
        
		if (!user)
			return res.status(401).json({
				message: "ERROR",
				cause: "User doesn't exist or token malfunctioned",
			});

		if (user._id.toString() !== res.locals.jwtData.id) {
			return res
				.status(401)
				.json({ message: "ERROR", cause: "Permissions didn't match" });
		}
		return res.status(200).json({ message: "OK", chats: user.chats });
	} catch (err) {
		console.log(err);
		return res.status(200).json({ message: "ERROR", cause: err.message });
	}
};

export const deleteAllChats = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findById(res.locals.jwtData.id); // get variable stored in previous middleware
        
		if (!user)
			return res.status(401).json({
				message: "ERROR",
				cause: "User doesn't exist or token malfunctioned",
			});

		if (user._id.toString() !== res.locals.jwtData.id) {
			return res
				.status(401)
				.json({ message: "ERROR", cause: "Permissions didn't match" });
		}

        //@ts-ignore
        user.chats = []
        await user.save()
		return res.status(200).json({ message: "OK", chats: user.chats });
	} catch (err) {
		console.log(err);
		return res.status(200).json({ message: "ERROR", cause: err.message });
	}
};