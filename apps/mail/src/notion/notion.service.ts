// notion.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotionService {
  private readonly NOTION_API =
    process.env.NOTION_API ?? 'https://api.notion.com/v1';
  private readonly NOTION_VERSION = process.env.NOTION_VERSION ?? '2022-06-28';

  private readonly NOTION_SECRET = process.env.NOTION_SECRET;
  private readonly notionPagesEndpoint = `${this.NOTION_API}/pages`;

  constructor(private readonly httpService: HttpService) {}

  async getDatabase(databaseId: string): Promise<any> {
    const response$ = this.httpService.get(
      `${this.NOTION_API}/databases/${databaseId}`,
      {
        headers: {
          Authorization: `Bearer ${this.NOTION_SECRET}`,
          'Notion-Version': this.NOTION_VERSION,
        },
      },
    );
    return (await firstValueFrom(response$)).data;
  }

  async queryDatabase(databaseId: string, body: any = {}): Promise<any> {
    const response$ = this.httpService.post(
      `${this.NOTION_API}/databases/${databaseId}/query`,
      body,
      {
        headers: {
          Authorization: `Bearer ${this.NOTION_SECRET}`,
          'Notion-Version': this.NOTION_VERSION,
          'Content-Type': 'application/json',
        },
      },
    );
    return await firstValueFrom(response$);
  }

  async appendEmailRecordToNotion(
    data: {
      to: string;
      from: string;
      subject: string;
      fallback: boolean;
      sended: boolean;
      emailID: string;
      templateName: string;
    },
    pageId: string,
  ) {
    console.log(pageId);
    const payload = {
      parent: {
        database_id: pageId, // Replace if needed
        type: 'database_id',
      },
      properties: {
        to: {
          title: [
            {
              text: {
                content: data.to,
              },
            },
          ],
        },
        from: {
          rich_text: [
            {
              text: {
                content: data.from,
              },
            },
          ],
        },
        subject: {
          rich_text: [
            {
              text: {
                content: data.subject,
              },
            },
          ],
        },
        fallback: {
          checkbox: data.fallback,
        },
        sended: {
          checkbox: data.sended,
        },
        templateName: {
          rich_text: [
            {
              text: {
                content: data.templateName,
              },
            },
          ],
        },
        emailID: {
          rich_text: [
            {
              text: {
                content: data.emailID,
              },
            },
          ],
        },
        // `date` is created automatically by Notion as "created_time"
      },
    };

    const headers = {
      Authorization: `Bearer ${this.NOTION_SECRET}`,
      'Notion-Version': this.NOTION_VERSION,
      'Content-Type': 'application/json',
    };

    try {
      const response$ = this.httpService.post(
        this.notionPagesEndpoint,
        payload,
        {
          headers,
        },
      );
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error(
        'Failed to append to Notion:',
        error?.response?.data || error.message,
      );
      throw new Error('Failed to append record to Notion database.');
    }
  }
}
