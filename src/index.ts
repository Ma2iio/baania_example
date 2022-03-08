import "reflect-metadata";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { createConnection } from "typeorm";
import { Postcode } from "./entity/postcode.entity";
import bodyParser from "body-parser";
import { IRequestCreateHouse, IRequestHomeParams, IRequestUpdateHouse } from "./interfaces";
import { House } from "./entity/house.entity";

createConnection()
  .then((connection) => {
    const app: Application = express();
    app.use(bodyParser.json());
    app.use(cors());

    const postCodeRepository = connection.getRepository(Postcode);
    const houseRepository = connection.getRepository(House);

    app.post(
      "/home",
      async (
        req: Request<{}, {}, IRequestCreateHouse>,
        res: Response
      ): Promise<Response> => {
        const payloadCreateHouse: IRequestCreateHouse = req.body;
        let postInfo = await postCodeRepository.findOne({
          where: {
            post_code: payloadCreateHouse.post_code,
          },
        });
        if (!postInfo) {
          postInfo = await postCodeRepository.save({
            post_code: payloadCreateHouse.post_code,
          });
        }
        if (postInfo) {
          await houseRepository.save({
            name: payloadCreateHouse.name,
            desc: payloadCreateHouse.desc,
            price: payloadCreateHouse.price,
            postCode: postInfo,
          });
          return res.status(200).json({});
        } else {
          return res.status(500).json({ message: "Postcode not found" });
        }
      }
    );

    app.get(
      "/home",
      async (req: Request<{}, {}, {}, IRequestHomeParams>, res: Response) => {
        const query: IRequestHomeParams = req.query;
        const [houseLists, count] = await houseRepository.findAndCount({
          skip: +query.skip,
          take: +query.take,
          order: {
            id: "ASC",
          },
          relations: ["postCode"],
        });

        // Transform for frontend use postCode in [modal] house detail
        const tranforPostCodeLists = houseLists.map((house: House) => ({
          ...house,
          postCode: house.post_code,
        }));
        return res.status(200).json({
          payload: tranforPostCodeLists,
          count,
        });
      }
    );

    app.patch(
      "/home/:id",
      async (req: Request<{ id: number }, {}, IRequestUpdateHouse>, res: Response) => {
        const params = req.params;
        const updateHouse = req.body;
        try {
          const postCodeInfo: Postcode = await postCodeRepository.findOne({
            where: {
              post_code: updateHouse.postCode,
            },
            relations: ["house", "house.postCode"],
          });
          const result = await houseRepository.update(params.id, {
            name: updateHouse.name,
            postCode: postCodeInfo,
            price: updateHouse.price,
            desc: updateHouse.desc,
          });
          return res.status(200).json({});
        } catch (error) {
          return res.status(400)
        }
      }
    );

    app.delete(
      "/home/:id",
      async (req: Request<{ id: number }>, res: Response) => {
        const params = req.params;
        try {
          const result = await houseRepository.delete(params.id);
          return res.status(200).json({});
        } catch (error) {
          return res.status(400)
        }
      }
    );

    app.get("/postCode", async (req: Request, res: Response) => {
      const [postCodeLists, count] = await postCodeRepository.findAndCount();
      return res.status(200).json({
        payload: postCodeLists,
        count,
      });
    });

    app.get(
      "/postCode/:postCode",
      async (req: Request<{ postCode: string }>, res: Response) => {
        try {
          const params = req.params;
          const postCodeInfo: Postcode = await postCodeRepository.findOne({
            where: {
              post_code: params.postCode,
            },
            relations: ["house", "house.postCode"],
          });

          let median = 0;
          const priceList = postCodeInfo.house
            .map((house: House) => house.price)
            .sort((a: number, b: number) => a - b);

          const summeryPrice = priceList.reduce(
            (sum: number, price: number) => sum + price,
            0
          );
          if (priceList.length % 2 === 0) {
            const leftNode = priceList.length / 2;
            const rightNode = (priceList.length / 2) + 1;

            median = (leftNode + rightNode) / 2;
          } else if (priceList.length > 2) {
              console.log({priceList})
            median = priceList[Math.floor(priceList.length / 2)];
          } else {
            median = summeryPrice;
          }
          return res.status(200).json({
            payload: {
              average: summeryPrice / postCodeInfo.house.length,
              median,
            },
          });
        } catch (error) {
            
        }
      }
    );

    app.listen(8000);
  })
  .catch((error) => console.log(error));
